// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {PositionManager} from "../src/PositionManager.sol";

contract PositionManagerTest is Test {
    PositionManager public positionManager;
    address nonfungiblePositionManager =
        0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
    address uniswapFactory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address myEOA = 0x42d8C4BA2f3E2c90D0a7045c25f36D67445f96b2;
    address tokenA = 0x9EC3c43006145f5701d4FD527e826131778cA122; // USDT
    address tokenB = 0xf4EE6EE04b2f3b34bA941d2C08828933d9D719A9; // ETH
    uint24 fee = 3000;
    int24 tickLower = -887220;
    int24 tickUpper = 887220;
    uint256 amountADesired = 9999999999999999724;
    uint256 amountBDesired = 9781121969859473;
    uint256 amountAMin = 9975093361076328755;
    uint256 amountBMin = 9756638522274018;
    uint256 constant THIS_BALANCE = 10 ether;

    function setUp() public {
        positionManager = new PositionManager(
            nonfungiblePositionManager,
            uniswapFactory
        );
    }

    function test_openPosition() public {
        uint160 sqrtPriceRatio = 2;

        positionManager.openPosition(
            PositionManager.PositionDirection.BUY,
            tokenA,
            tokenB,
            fee,
            sqrtPriceRatio,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
    }

    function test_getPoolAddress() public view {
        positionManager.getPoolAddress(
            tokenA,
            tokenB,
            fee
        );
    }

    function test_addLiquidity() public {
        // vm.startPrank(myEOA);
        // vm.deal(address(this), THIS_BALANCE);
        positionManager.addLiquidity(
            tokenA,
            tokenB,
            fee,
            tickLower,
            tickUpper,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        // vm.stopPrank();
    }
}
