// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@uniswap-v3-periphery/contracts/interfaces/InonFungiblePositionManager.sol";
import "@uniswap-v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap-v3-core/contracts/libraries/TickMath.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap-v3-core/contracts/interfaces/IUniswapV3Factory.sol";

contract PositionManager {
    INonfungiblePositionManager public immutable nonfungiblePositionManager;
    IUniswapV3Factory public immutable uniswapFactory;

    // TODO: remove
    uint256 amount0ToMint = 0;
    uint256 amount1ToMint = 0;
    uint256 amount0ToAdd = 0;
    uint256 amount1ToAdd = 0;
    address recepient;

    struct Position {
        uint256 tokenId;
        address tokenA;
        address tokenB;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 liquidity;
        uint256 amountA;
        uint256 amountB;
        address owner;
    }

    mapping(uint256 => Position) public positions;

    event PositionOpened(
        uint256 indexed positionId,
        address user,
        uint24 tickLower,
        uint24 tickUpper
    );
    event PositionClosed(
        uint256 indexed positionId,
        address user,
        uint24 tickLower,
        uint24 tickUpper
    );

    constructor(address _nonfungiblePositionManager, address _uniswapFactory) {
        nonfungiblePositionManager = INonfungiblePositionManager(
            _nonfungiblePositionManager
        );
        uniswapFactory = IUniswapV3Factory(uniswapFactory);
    }

    function addLiquidity(
        address payable tokenA,
        address payable tokenB,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address recipient,
        uint256 deadline
    ) external {
        // transfer tokens to contract
        TransferHelper.safeTransferFrom(
            tokenA,
            msg.sender,
            address(this),
            amount0ToMint
        );
        TransferHelper.safeTransferFrom(
            tokenB,
            msg.sender,
            address(this),
            amount1ToMint
        );

        // Approve the position manager
        TransferHelper.safeApprove(
            tokenA,
            address(nonfungiblePositionManager),
            amount0ToMint
        );
        TransferHelper.safeApprove(
            tokenB,
            address(nonfungiblePositionManager),
            amount1ToMint
        );

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
                recipient: recipient,
                deadline: deadline
            });

        (
            uint256 tokenId,
            uint256 liquidity,
            uint256 amount0,
            uint256 amount1
        ) = nonfungiblePositionManager.mint(params);

        // Сохранение информации о позиции
        positions[tokenId] = Position({
            tokenId: tokenId,
            tokenA: tokenA,
            tokenB: tokenB,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidity,
            amountA: amount0,
            amountB: amount1,
            owner: recipient
        });
        
        //вернём юзеру остатки
        if (amount0 < amount0ToAdd) {
            // tokenA.approve(address(nonfungiblePositionManager), 0);
            uint refund0 = amount0ToAdd - amount0;
            tokenA.transfer(refund0);
        }
        if (amount1 < amount1ToAdd) {
            // tokenB.approve(address(nonfungiblePositionManager), 0);
            uint refund1 = amount1ToAdd - amount1;
            tokenB.transfer(refund1);
        }

        emit PositionOpened(tokenId, recepient, tickLower, tickUpper);
    }

    //функция для уменьшения ликвидности для указанной позиции
    function decreaseLiquidity(uint256 tokenId) internal {
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: positions[tokenId].liquidity,
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        nonfungiblePositionManager.decreaseLiquidity(params);
    }

    //функция чтобы забрать средства с позиции
    function collect(uint256 tokenId) internal {
        INonfungiblePositionManager.CollectParams
            memory params = INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: positions[tokenId].owner, //отправляем юзеру
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        nonfungiblePositionManager.collect(params);
    }

    //сжигаем нфт позиции
    function burnPosition(uint256 tokenId) internal {
        nonfungiblePositionManager.burn(tokenId);
    }

    //функция для проверки ончейн нужно ли закрывать позицию
    function canClosePosition(uint256 tokenId) public view returns (bool) {
        address pool = getPoolAddress(
            positions[tokenId].tokenA,
            positions[tokenId].tokenB,
            positions[tokenId].fee
        );
        uint24 currentTick = getCurrentTick(pool);
        return
            currentTick > positions[tokenId].tickUpper ||
            currentTick < positions[tokenId].tickLower;
    }

    //закрываем позицию с бэкэнда
    function closePosition(uint256 tokenId) public {
        require(canClosePosition(tokenId), "position not need to close");

        decreaseLiquidity(tokenId);
        collect(tokenId);
        burnPosition(tokenId);

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
        address operator,
        address,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
