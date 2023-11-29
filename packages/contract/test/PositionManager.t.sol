// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console2} from "forge-std/Test.sol";
import {PositionManager} from "../src/PositionManager.sol";

contract PositionManagerTest is Test {
    PositionManager public positionManager;
    address nonfungiblePositionManager = 0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
    address uniswapFactory = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address myEOA = 0x42d8C4BA2f3E2c90D0a7045c25f36D67445f96b2;

    function setUp() public {
        positionManager = new PositionManager(nonfungiblePositionManager, uniswapFactory);
    }

    function test_Increment() public {
        address tokenA = 0x9EC3c43006145f5701d4FD527e826131778cA122; // USDT
        address tokenB = 0xf4EE6EE04b2f3b34bA941d2C08828933d9D719A9; // ETH
        uint24 fee = 3000;
        int24 tickLower = -68303;
        int24 tickUpper = -69303;
        uint256 amountADesired = 100000000000000000000;
        uint256 amountBDesired = 0;
        uint256 amountAMin = 0;
        uint256 amountBMin = 0;
        address recipient = myEOA;
        uint256 deadline = block.timestamp;


        positionManager.addLiquidity(tokenA, tokenB, fee, tickLower, tickUpper, amountADesired, amountBDesired, amountAMin, amountBMin, recipient, deadline);
        assertEq(1, 1);
    }
}
