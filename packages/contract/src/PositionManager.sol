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
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@abdk-libraries-solidity/ABDKMath64x64.sol";

import {console2} from "forge-std/Test.sol";

contract PositionManager is IERC721Receiver, Pausable, Ownable {
    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    IUniswapV3Factory public immutable uniswapFactory;

    mapping(uint256 => Position) public positions;

    struct Position {
        uint256 tokenId;
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 liquidity;
        uint256 amountA;
        uint256 amountB;
        address owner;
    }

    enum PositionDirection {
        BUY,
        SELL
    }

    event PositionOpened(
        uint256 indexed positionId,
        address user,
        int24 tickLower,
        int24 tickUpper,
        address poolAddress
    );

    event PositionClosed(
        uint256 indexed positionId,
        address user,
        int24 tickLower,
        int24 tickUpper
    );

    constructor(address _nonfungiblePositionManager, address _uniswapFactory) {
        nonfungiblePositionManager = INonfungiblePositionManager(
            _nonfungiblePositionManager
        );
        uniswapFactory = IUniswapV3Factory(_uniswapFactory);
    }

    function setPause(bool state) public onlyOwner {
        state ? _pause() : _unpause();
    }

    function openBuyPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountA
    ) public whenNotPaused {
        openPosition(
            PositionDirection.BUY,
            tokenA,
            tokenB,
            fee,
            stopSqrtPriceX96,
            amountA,
            0,
            amountA - 1, // to pass slippage check
            0
        );
    }

    function openSellPosition(
        address tokenA,
        address tokenB,
        uint24 fee,
        uint160 stopSqrtPriceX96,
        uint256 amountB
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
            amountB - 1 // to pass slippage check
        );
    }

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
        address currentPool = getPoolAddress(tokenA, tokenB, fee);
        int24 startingTick;
        int24 trailingTick;
        int24 tickSpacing = IUniswapV3PoolImmutables(currentPool).tickSpacing();

        IUniswapV3Pool uniswapPool = IUniswapV3Pool(currentPool);
        (, startingTick, , , , , ) = uniswapPool.slot0();

        trailingTick = _nearestUsableTick(
            TickMath.getTickAtSqrtRatio(stopSqrtPriceX96),
            tickSpacing
        );

        if (positionDirection == PositionDirection.BUY) {
            startingTick =
                _nearestUsableTick(startingTick, tickSpacing) +
                tickSpacing;

            uint256 tokenId = _addLiquidity(
                tokenA,
                tokenB,
                fee,
                startingTick,
                trailingTick,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                true,
                false
            );

            emit PositionOpened(
                tokenId,
                msg.sender,
                startingTick,
                trailingTick,
                currentPool
            );
        } else if (positionDirection == PositionDirection.SELL) {
            startingTick =
                _nearestUsableTick(startingTick, tickSpacing) -
                tickSpacing;

            uint256 tokenId = _addLiquidity(
                tokenA,
                tokenB,
                fee,
                trailingTick,
                startingTick,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                false,
                true
            );

            emit PositionOpened(
                tokenId,
                msg.sender,
                trailingTick,
                startingTick,
                currentPool
            );
        }
    }

    //функция для проверки ончейн нужно ли закрывать позицию
    function canClosePosition(uint256 tokenId) public view returns (bool) {
        address pool = getPoolAddress(
            positions[tokenId].token0,
            positions[tokenId].token1,
            positions[tokenId].fee
        );
        int24 currentTick = getCurrentTick(pool);
        return
            currentTick > positions[tokenId].tickUpper ||
            currentTick < positions[tokenId].tickLower;
    }

    //закрываем позицию с бэкэнда
    function closePosition(uint256 tokenId) public {
        require(canClosePosition(tokenId), "position not need to close");

        _decreaseLiquidity(tokenId);
        _collect(tokenId);
        _burnPosition(tokenId);

        delete positions[tokenId];

        emit PositionClosed(
            tokenId,
            positions[tokenId].owner,
            positions[tokenId].tickLower,
            positions[tokenId].tickUpper
        );
    }

    //функция для получения адреса пула
    function getPoolAddress(
        address tokenA,
        address tokenB,
        uint24 fee
    ) public view returns (address pool) {
        pool = uniswapFactory.getPool(tokenA, tokenB, fee);
    }

    //функция для получения текущего тика на пуле
    function getCurrentTick(address pool) public view returns (int24 tick) {
        IUniswapV3Pool uniswapPool = IUniswapV3Pool(pool);
        (, tick, , , , , ) = uniswapPool.slot0();
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

    function _addLiquidity(
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
        // transfer tokens to contract
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

        // Approve the position manager
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

        // Создание позиции и добавление ликвидности
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
            uint256 liquidity,
            uint256 amount0,
            uint256 amount1
        ) = nonfungiblePositionManager.mint(params);

        _tokenId = tokenId;

        // Сохранение информации о позиции
        positions[tokenId] = Position({
            tokenId: tokenId,
            token0: tokenA,
            token1: tokenB,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidity,
            amountA: amount0,
            amountB: amount1,
            owner: msg.sender
        });

        //вернём юзеру остатки
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

    //функция для уменьшения ликвидности для указанной позиции
    function _decreaseLiquidity(uint256 tokenId) internal {
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: uint128(positions[tokenId].liquidity),
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        nonfungiblePositionManager.decreaseLiquidity(params);
    }

    //функция чтобы забрать средства с позиции
    function _collect(uint256 tokenId) internal {
        INonfungiblePositionManager.CollectParams memory params = INonfungiblePositionManager
            .CollectParams({
                tokenId: tokenId,
                recipient: positions[tokenId].owner, //отправляем юзеру
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        nonfungiblePositionManager.collect(params);
    }

    //сжигаем нфт позиции
    function _burnPosition(uint256 tokenId) internal {
        nonfungiblePositionManager.burn(tokenId);
    }
}
