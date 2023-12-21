// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@uniswap-v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap-v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap-v3-core/contracts/libraries/TickMath.sol";
import "@uniswap-v3-core/contracts/libraries/FullMath.sol";
import "@uniswap-v3-core/contracts/libraries/FixedPoint96.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@abdk-libraries-solidity/ABDKMath64x64.sol";

import {console2} from "forge-std/Test.sol";

contract PositionManager is ERC721, IERC721Receiver, Pausable, Ownable {
    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    IUniswapV3Factory public immutable uniswapFactory;

    mapping(uint256 => Position) public position2Owner;
    mapping(address => uint256[]) public owner2Positions;
    mapping(uint256 => uint256) public position2NFTId;

    uint256 private _nextNFTId = 1;

    struct Position {
        address owner;
        uint256 amountA;
        uint256 amountB;
        PositionDirection positionDirection;
    }

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
        uint256 indexed positionId,
        address indexed user,
        int24 stopTick,
        address poolAddress,
        uint256 amountA
    );

    event SellPositionOpened(
        uint256 indexed positionId,
        address indexed user,
        int24 stopTick,
        address poolAddress,
        uint256 amountB
    );

    event PositionClosed(uint256 indexed positionId, address indexed user);

    constructor(
        address _nonfungiblePositionManager,
        address _uniswapFactory
    ) ERC721("Chain-owls PositionManager NFT", "CHAIN-OWLS-POS") {
        nonfungiblePositionManager = INonfungiblePositionManager(
            _nonfungiblePositionManager
        );
        uniswapFactory = IUniswapV3Factory(_uniswapFactory);
    }

    // Function that sets pause state of the contract
    function setPause(bool state) public onlyOwner {
        state ? _pause() : _unpause();
    }

    // Function that opens BUY (down-direction) position using ONLY tokenA
    function openBuyPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountA,
        uint256 amountAMin
    ) public whenNotPaused {
        openPosition(
            PositionDirection.BUY,
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

    // Function that opens SELL (up-direction) position using ONLY tokenB
    function openSellPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountB,
        uint256 amountBMin
    ) public whenNotPaused {
        openPosition(
            PositionDirection.SELL,
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

    // Generic function that opens ANY (any-direction) position using tokenA AND|OR tokenB
    function openPosition(
        PositionDirection positionDirection,
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) public whenNotPaused {
        address pool = getPoolAddress(tokenA, tokenB, fee);
        int24 currentTick;
        int24 startTick;
        int24 stopTick;
        int24 tickSpacing = IUniswapV3PoolImmutables(pool).tickSpacing();

        (, currentTick, , , , , ) = IUniswapV3Pool(pool).slot0();

        startTick = _nearestUsableTick(currentTick, tickSpacing);
        stopTick = _nearestUsableTick(
            TickMath.getTickAtSqrtRatio(stopSqrtPriceX96),
            tickSpacing
        );

        if (positionDirection == PositionDirection.BUY) {
            startTick += tickSpacing;

            require(
                startTick < stopTick,
                "Stop price must be lower than the current"
            );

            uint256 tokenId = _addLiquidity(
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
                false
            );

            emit BuyPositionOpened(
                tokenId,
                msg.sender,
                stopTick,
                pool,
                position2Owner[tokenId].amountA
            );
        } else if (positionDirection == PositionDirection.SELL) {
            startTick -= tickSpacing;

            require(
                startTick > stopTick,
                "Stop price must be higher than the current"
            );

            uint256 tokenId = _addLiquidity(
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
                true
            );

            emit SellPositionOpened(
                tokenId,
                msg.sender,
                stopTick,
                pool,
                position2Owner[tokenId].amountB
            );
        }
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

        ) = nonfungiblePositionManager.positions(tokenId);
        address pool = getPoolAddress(token0, token1, fee);
        int24 currentTick = getCurrentTick(pool);
        return currentTick > tickUpper || currentTick < tickLower;
    }

    // Function that closes the position
    function closePosition(uint256 tokenId) public {
        require(canClosePosition(tokenId), "position not need to close");

        _decreaseLiquidity(tokenId);
        _collect(tokenId);
        _burnPosition(tokenId);

        delete position2Owner[tokenId];

        // find and clear tokenId in owner2Positions map
        bool isMoveElement;
        for (uint i = 0; i < owner2Positions[msg.sender].length; i++) {
            if (owner2Positions[msg.sender][i] == tokenId) {
                isMoveElement = true;
                continue;
            }
            if (isMoveElement) {
                owner2Positions[msg.sender][i - 1] = owner2Positions[
                    msg.sender
                ][i];
            }
        }

        // pop the last element (for arrays.length > 1)
        if (owner2Positions[msg.sender].length != 0) {
            owner2Positions[msg.sender].pop();
        }

        // delete the whole record (for arrays.length == 1)
        if (owner2Positions[msg.sender].length == 0) {
            delete owner2Positions[msg.sender];
        }

        emit PositionClosed(tokenId, position2Owner[tokenId].owner);
    }

    // Function that provides the current price of pool in SqrtX96 format
    function getCurrentSqrtPriceX96(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (uint160 currentSqrtPriceX96) {
        address pool = uniswapFactory.getPool(tokenA, tokenB, fee);
        (currentSqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
    }

    // Function that gets the pool address
    function getPoolAddress(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (address pool) {
        pool = uniswapFactory.getPool(tokenA, tokenB, fee);
    }

    // Function that gets the current tick on the particular pool
    function getCurrentTick(address pool) public view returns (int24 tick) {
        (, tick, , , , , ) = IUniswapV3Pool(pool).slot0();
    }

    function getOpenPositions(
        address user
    ) public view returns (PositionExtended[] memory) {
        uint256[] memory ups = owner2Positions[user];
        PositionExtended[] memory ps = new PositionExtended[](ups.length);

        for (uint i = 0; i < ups.length; i++) {
            uint256 tokenId = ups[i];
            Position memory position = position2Owner[tokenId];
            ps[i].pos = position;
            (
                ps[i].nonce,
                ps[i].operator,
                ps[i].token0,
                ps[i].token1,
                ps[i].fee,
                ps[i].tickLower,
                ps[i].tickUpper,
                ps[i].liquidity,
                ps[i].feeGrowthInside0LastX128,
                ps[i].feeGrowthInside1LastX128,
                ps[i].tokensOwed0,
                ps[i].tokensOwed1
            ) = nonfungiblePositionManager.positions(tokenId);
        }

        return ps;
    }

    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    function onERC721Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*tokenId*/,
        bytes calldata /*data*/
    ) public pure override returns (bytes4) {
        //
        return this.onERC721Received.selector;
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 /*firstTokenId*/,
        uint256 /*batchSize*/
    ) internal virtual override {
        // skip mint & burn
        if (from == address(0x0) || to == address(0x0)) {
            return;
        }

        uint256[] memory currentPositions = owner2Positions[from];

        // rewrite the owner records in position2Owner
        for (uint i = 0; i < currentPositions.length; i++) {
            uint256 tokenId = currentPositions[i];
            Position memory pos = position2Owner[tokenId];

            // set new owner
            pos.owner = to;
            position2Owner[tokenId] = pos;
        }

        // rewrite the records in owner2Positions
        owner2Positions[to] = currentPositions;
        delete owner2Positions[from];
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
        bool useTokenB
    ) internal returns (uint256 _tokenId) {
        // transfer tokens to the contract
        if (useTokenA) {
            TransferHelper.safeTransferFrom(
                tokenA,
                msg.sender,
                address(this),
                amountADesired
            );
        }
        if (useTokenB) {
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
                address(nonfungiblePositionManager),
                amountADesired
            );
        }
        if (useTokenB) {
            TransferHelper.safeApprove(
                tokenB,
                address(nonfungiblePositionManager),
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
            uint256 tokenId,
            ,
            uint256 amount0,
            uint256 amount1
        ) = nonfungiblePositionManager.mint(params);

        _tokenId = tokenId;

        // store information about position
        position2Owner[tokenId] = Position({
            positionDirection: positionDirection,
            owner: msg.sender,
            amountA: amount0,
            amountB: amount1
        });

        // store user's positions
        owner2Positions[msg.sender].push(tokenId);

        // mint NFT & store to mapping
        uint256 currentNFTId = _nextNFTId++;
        super._safeMint(msg.sender, currentNFTId);
        position2NFTId[tokenId] = currentNFTId;

        // refunds the unspent amount
        if (useTokenA) {
            if (amount0 < amountADesired) {
                uint refund0 = amountADesired - amount0;
                TransferHelper.safeApprove(
                    tokenA,
                    address(nonfungiblePositionManager),
                    refund0
                );
                TransferHelper.safeTransfer(tokenA, msg.sender, refund0);
            }
        }
        if (useTokenB) {
            if (amount1 < amountBDesired) {
                uint refund1 = amountBDesired - amount1;
                TransferHelper.safeApprove(
                    tokenB,
                    address(nonfungiblePositionManager),
                    refund1
                );
                TransferHelper.safeTransfer(tokenA, msg.sender, refund1);
            }
        }
    }

    // Function that decreases the liquidity
    function _decreaseLiquidity(uint256 tokenId) internal {
        uint128 liquidity;
        (, , , , , , , liquidity, , , , ) = nonfungiblePositionManager
            .positions(tokenId);
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: uint128(liquidity),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        nonfungiblePositionManager.decreaseLiquidity(params);
    }

    // function that collects the position funds
    function _collect(uint256 tokenId) internal {
        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager
            .CollectParams({
                tokenId: tokenId,
                recipient: position2Owner[tokenId].owner, // send to user
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        nonfungiblePositionManager.collect(params);
    }

    // function that that burns the NFT
    function _burnPosition(uint256 tokenId) internal {
        nonfungiblePositionManager.burn(tokenId);
        super._burn(position2NFTId[tokenId]);
        delete position2NFTId[tokenId];
    }
}
