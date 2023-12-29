// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@uniswap-v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap-v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap-v3-core/contracts/libraries/TickMath.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@abdk-libraries-solidity/ABDKMath64x64.sol";
import "../interface/IWETH9.sol";

import {console2} from "forge-std/Test.sol";

contract PositionManager is
    ERC721Enumerable,
    IERC721Receiver,
    Pausable,
    Ownable
{
    INonfungiblePositionManager public immutable _nonfungiblePositionManager;
    IUniswapV3Factory public immutable _uniswapFactory;
    IWETH9 public immutable _WETH9;
    address public immutable _ETH;

    // Mapping from PositionManager's Token ID to Positions
    mapping(uint256 => Position) private _positions;

    // PositionManager's NFT token id
    uint256 private _nextTokenId;

    // Position structure (on-chain storage)
    struct Position {
        PositionDirection positionDirection;
        uint256 amount;
        uint256 uniswapTokenId;
        bool isNativeA;
        bool isNativeB;
    }

    // Extended position structure (not stored on-chain)
    struct PositionExtended {
        Position pos;
        uint96 nonce;
        address operator;
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint128 liquidity;
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    enum PositionDirection {
        BUY,
        SELL
    }

    event BuyPositionOpened(
        uint256 indexed tokenId,
        address indexed user,
        int24 stopTick,
        address poolAddress,
        uint256 amountA
    );

    event SellPositionOpened(
        uint256 indexed tokenId,
        address indexed user,
        int24 stopTick,
        address poolAddress,
        uint256 amountB
    );

    event PositionClosed(uint256 indexed tokenId, address indexed user);

    constructor(
        address nonfungiblePositionManager_,
        address uniswapFactory_,
        address WETH_,
        address ETH_
    ) ERC721("Chain-owls PositionManager NFT", "CHAIN-OWLS-POS") {
        _nonfungiblePositionManager = INonfungiblePositionManager(
            nonfungiblePositionManager_
        );
        _uniswapFactory = IUniswapV3Factory(uniswapFactory_);
        _WETH9 = IWETH9(WETH_);
        _ETH = ETH_;
    }

    // Function that sets pause state of the contract
    function setPause(bool state) public onlyOwner {
        state ? _pause() : _unpause();
    }

    // Function that opens BUY (down-direction) position using ONLY tokenB
    function openBuyPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountB,
        uint256 amountBMin
    ) public payable whenNotPaused {
        _openPosition(
            PositionDirection.BUY,
            tokenA,
            tokenB,
            fee,
            stopSqrtPriceX96,
            0,
            amountB,
            0,
            amountBMin
        );
    }

    // Function that opens SELL (up-direction) position using ONLY tokenA
    function openSellPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountA,
        uint256 amountAMin
    ) public payable whenNotPaused {
        _openPosition(
            PositionDirection.SELL,
            tokenA,
            tokenB,
            fee,
            stopSqrtPriceX96,
            amountA,
            0,
            amountAMin,
            0
        );
    }

    // Function that checks if position can be closed
    function canClosePosition(uint256 tokenId) public view returns (bool) {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        (
            ,
            ,
            token0,
            token1,
            fee,
            tickLower,
            tickUpper,
            ,
            ,
            ,
            ,

        ) = _nonfungiblePositionManager.positions(
            _positions[tokenId].uniswapTokenId
        );
        address pool = getPoolAddress(token0, token1, fee);
        int24 currentTick = getCurrentTick(pool);
        PositionDirection dir = _positions[tokenId].positionDirection;

        if (dir == PositionDirection.BUY) {
            return currentTick < tickLower;
        } else {
            return currentTick > tickUpper;
        }
    }

    // Function that closes the position
    function closePosition(uint256 tokenId) public {
        // keep address before burning the token
        address owner = ERC721.ownerOf(tokenId);

        require(
            msg.sender == owner || canClosePosition(tokenId),
            "PositionManager: position can't be closed"
        );

        _decreaseLiquidity(tokenId);
        collect(tokenId);
        _burnPosition(tokenId);

        emit PositionClosed(tokenId, owner);
    }

    // Function that provides the current price of pool in SqrtX96 format
    function getCurrentSqrtPriceX96(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (uint160 currentSqrtPriceX96) {
        address pool = _uniswapFactory.getPool(tokenA, tokenB, fee);
        (currentSqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
    }

    // Function that gets the pool address
    function getPoolAddress(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (address pool) {
        pool = _uniswapFactory.getPool(tokenA, tokenB, fee);
    }

    // Function that gets the current tick on the particular pool
    function getCurrentTick(address pool) public view returns (int24 tick) {
        (, tick, , , , , ) = IUniswapV3Pool(pool).slot0();
    }

    // Function that returns open positions array owned by user
    function getOpenPositions(
        address user
    ) public view returns (PositionExtended[] memory) {
        uint count = ERC721.balanceOf(user);
        PositionExtended[]
            memory positionExtendedArray = new PositionExtended[](count);

        for (uint ix = 0; ix < ERC721.balanceOf(user); ix++) {
            uint256 tokenId = ERC721Enumerable.tokenOfOwnerByIndex(user, ix);
            positionExtendedArray[ix].pos = _positions[tokenId];
            (
                positionExtendedArray[ix].nonce,
                positionExtendedArray[ix].operator,
                positionExtendedArray[ix].token0,
                positionExtendedArray[ix].token1,
                positionExtendedArray[ix].fee,
                positionExtendedArray[ix].tickLower,
                positionExtendedArray[ix].tickUpper,
                positionExtendedArray[ix].liquidity,
                positionExtendedArray[ix].feeGrowthInside0LastX128,
                positionExtendedArray[ix].feeGrowthInside1LastX128,
                positionExtendedArray[ix].tokensOwed0,
                positionExtendedArray[ix].tokensOwed1
            ) = _nonfungiblePositionManager.positions(
                _positions[tokenId].uniswapTokenId
            );
        }

        return positionExtendedArray;
    }

    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    function onERC721Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) public pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // Function that collects the position funds
    function collect(uint256 tokenId) public {
        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager
            .CollectParams({
                tokenId: _positions[tokenId].uniswapTokenId,
                recipient: address(this), // send to contract
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (uint256 amount0, uint256 amount1) = _nonfungiblePositionManager
            .collect(params);

        _sendToOwner(
            _positions[tokenId].uniswapTokenId,
            ERC721.ownerOf(tokenId),
            amount0,
            amount1,
            _positions[tokenId].isNativeA,
            _positions[tokenId].isNativeB
        );
    }

    // ========================================================================
    // PRIVATE FUNCTIONS:
    // ========================================================================

    // Function that check native balance and wrap native if needed
    function _wrap(uint256 amount) private {
        require(
            msg.value >= amount,
            "PositionManager: Insufficient balance of MATIC"
        );
        _WETH9.deposit{value: amount}();
    }

    // Generic function that opens ANY (any-direction) position using tokenA AND|OR tokenB
    function _openPosition(
        PositionDirection positionDirection,
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) private whenNotPaused {
        address pool;
        int24 currentTick;
        int24 startTick;
        int24 stopTick;
        int24 tickSpacing;
        bool isNativeA;
        bool isNativeB;

        if (tokenA == _ETH) {
            _wrap(amountADesired);
            tokenA = address(_WETH9);
            isNativeA = true;
        } else if (tokenB == _ETH) {
            _wrap(amountBDesired);
            tokenB = address(_WETH9);
            isNativeB = true;
        }

        pool = getPoolAddress(tokenA, tokenB, fee);
        tickSpacing = IUniswapV3PoolImmutables(pool).tickSpacing();
        (, currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();

        startTick = _nearestUsableTick(currentTick, tickSpacing);
        stopTick = _nearestUsableTick(
            TickMath.getTickAtSqrtRatio(stopSqrtPriceX96),
            tickSpacing
        );

        if (positionDirection == PositionDirection.BUY) {
            startTick -= tickSpacing;

            require(
                startTick > stopTick,
                "PositionManager: Stop price must be lower than the current"
            );

            _addLiquidity(
                positionDirection,
                tokenA,
                tokenB,
                fee,
                stopTick,
                startTick,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                false,
                true,
                isNativeA,
                isNativeB
            );

            emit BuyPositionOpened(
                _nextTokenId,
                msg.sender,
                stopTick,
                pool,
                _positions[_nextTokenId].amount
            );
        } else if (positionDirection == PositionDirection.SELL) {
            startTick += tickSpacing;

            require(
                startTick < stopTick,
                "PositionManager: Stop price must be higher than the current"
            );

            _addLiquidity(
                positionDirection,
                tokenA,
                tokenB,
                fee,
                startTick,
                stopTick,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                true,
                false,
                isNativeA,
                isNativeB
            );

            emit SellPositionOpened(
                _nextTokenId,
                msg.sender,
                stopTick,
                pool,
                _positions[_nextTokenId].amount
            );
        }
    }

    // Function that adds the liquidity and create a new position
    function _addLiquidity(
        PositionDirection positionDirection,
        address tokenA,
        address tokenB,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        bool useTokenA,
        bool useTokenB,
        bool isNativeA,
        bool isNativeB
    ) internal {
        // transfer tokens to the contract
        if (useTokenA && !isNativeA) {
            TransferHelper.safeTransferFrom(
                tokenA,
                msg.sender,
                address(this),
                amountADesired
            );
        }
        if (useTokenB && !isNativeB) {
            TransferHelper.safeTransferFrom(
                tokenB,
                msg.sender,
                address(this),
                amountBDesired
            );
        }

        // approve the position manager
        if (useTokenA) {
            TransferHelper.safeApprove(
                tokenA,
                address(_nonfungiblePositionManager),
                amountADesired
            );
        }
        if (useTokenB) {
            TransferHelper.safeApprove(
                tokenB,
                address(_nonfungiblePositionManager),
                amountBDesired
            );
        }

        // create position and add the liquidity
        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: tokenA,
                token1: tokenB,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: amountADesired,
                amount1Desired: amountBDesired,
                amount0Min: amountAMin,
                amount1Min: amountBMin,
                recipient: address(this),
                deadline: block.timestamp + 10 days
            });

        (
            uint256 uniswapTokenId,
            ,
            uint256 amount0,
            uint256 amount1
        ) = _nonfungiblePositionManager.mint(params);

        uint256 currentTokenId = ++_nextTokenId;

        // store information about position
        _positions[_nextTokenId] = Position({
            positionDirection: positionDirection,
            amount: (positionDirection == PositionDirection.BUY)
                ? amount0
                : amount1,
            uniswapTokenId: uniswapTokenId,
            isNativeA: isNativeA,
            isNativeB: isNativeB
        });

        // mint NFT & store to mapping
        ERC721._safeMint(msg.sender, currentTokenId);

        // refunds the unspent amount
        if (useTokenA) {
            if (amount0 < amountADesired) {
                uint refund0 = amountADesired - amount0;
                if (isNativeA) {
                    _WETH9.withdraw(refund0);
                    payable(msg.sender).transfer(refund0);
                } else {
                    TransferHelper.safeTransfer(tokenA, msg.sender, refund0);
                }
            }
        }
        if (useTokenB) {
            if (amount1 < amountBDesired) {
                uint refund1 = amountBDesired - amount1;
                if (isNativeB) {
                    _WETH9.withdraw(refund1);
                    payable(msg.sender).transfer(refund1);
                } else {
                    TransferHelper.safeTransfer(tokenB, msg.sender, refund1);
                }
            }
        }
    }

    // Function that returns the nearest tick
    // https://uniswapv3book.com/docs/milestone_4/tick-rounding/
    function _nearestUsableTick(
        int24 tick_,
        int24 tickSpacing
    ) internal pure returns (int24 result) {
        result =
            int24(_divRound(int128(tick_), int128(tickSpacing))) *
            tickSpacing;

        if (result < TickMath.MIN_TICK) {
            result += tickSpacing;
        } else if (result > TickMath.MAX_TICK) {
            result -= tickSpacing;
        }
    }

    // div helper function
    function _divRound(
        int128 x,
        int128 y
    ) internal pure returns (int128 result) {
        int128 quot = ABDKMath64x64.div(x, y);
        result = quot >> 64;

        // Check if remainder is greater than 0.5
        if (quot % 2 ** 64 >= 0x8000000000000000) {
            result += 1;
        }
    }

    // Function that decreases the liquidity
    function _decreaseLiquidity(uint256 tokenId) internal {
        uint128 liquidity;
        (, , , , , , , liquidity, , , , ) = _nonfungiblePositionManager
            .positions(_positions[tokenId].uniswapTokenId);
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: _positions[tokenId].uniswapTokenId,
                    liquidity: liquidity,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        _nonfungiblePositionManager.decreaseLiquidity(params);
    }

    // Function that sends the tokens back to owner
    function _sendToOwner(
        uint256 uniswapTokenId,
        address owner,
        uint256 amount0,
        uint256 amount1,
        bool isNative0,
        bool isNative1
    ) internal {
        (
            ,
            ,
            address token0,
            address token1,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = _nonfungiblePositionManager.positions(uniswapTokenId);

        if (amount0 > 0) {
            if (isNative0) {
                _WETH9.withdraw(amount0);
                payable(owner).transfer(amount0);
            } else {
                TransferHelper.safeTransfer(token0, owner, amount0);
            }
        }
        if (amount1 > 0) {
            if (isNative1) {
                _WETH9.withdraw(amount1);
                payable(owner).transfer(amount1);
            } else {
                TransferHelper.safeTransfer(token1, owner, amount1);
            }
        }
    }

    // Function that that burns the NFT
    function _burnPosition(uint256 tokenId) internal {
        _nonfungiblePositionManager.burn(_positions[tokenId].uniswapTokenId);
        delete _positions[tokenId];
        ERC721._burn(tokenId);
    }

    // Function that just recieves plain native token
    receive() external payable {}

    // Fallback function
    fallback() external payable {}
}
