// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console2, StdStyle} from "forge-std/Test.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {Constants} from "./Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PositionManagerTest is Test, Constants {
    PositionManager public positionManager;

    address public owner = vm.addr(0xCFAE);

    function setUp() public {
        vm.createSelectFork(
            "https://polygon-mumbai.g.alchemy.com/v2/RrXlJHdd3rcZZ3BZXadGxpXu6SA8gQN5"
        );
        vm.startPrank(MY_EOA);

        positionManager = new PositionManager(
            UNISWAP_V3_NPM,
            UNISWAP_V3_FACTORY
        );

        deal(MY_USDT, MY_EOA, AMOUNT_A_DESIRED);
        deal(MY_ETH, MY_EOA, AMOUNT_B_DESIRED);

        IERC20(MY_USDT).approve(address(positionManager), AMOUNT_A_DESIRED);
        IERC20(MY_ETH).approve(address(positionManager), AMOUNT_B_DESIRED);

        vm.stopPrank();

        showTokensInfo();
    }

    function test_getPoolAddress() public {
        vm.startPrank(MY_EOA);

        address pool = positionManager.getPoolAddress(
            MY_USDT,
            MY_ETH,
            FEE_3000
        );

        vm.stopPrank();

        assertEq(pool, UNISWAP_V3_POOL_MY_USDT_MY_ETH);
    }

    function test_openPosition() public {
        uint160 sqrtPriceRatio = 2;

        vm.startPrank(MY_EOA);

        positionManager.openPosition(
            PositionManager.PositionDirection.BUY,
            MY_USDT,
            MY_ETH,
            FEE_3000,
            sqrtPriceRatio,
            AMOUNT_A_DESIRED,
            AMOUNT_B_DESIRED,
            AMOUNT_A_MIN,
            AMOUNT_B_MIN
        );

        vm.stopPrank();
    }

    function test_addLiquidity() public {
        vm.startPrank(MY_EOA);

        positionManager.addLiquidity(
            MY_USDT,
            MY_ETH,
            FEE_3000,
            UNISWAP_FULL_RANGE_TICK_LOWER,
            UNISWAP_FULL_RANGE_TICK_UPPER,
            AMOUNT_A_DESIRED,
            AMOUNT_B_DESIRED,
            AMOUNT_A_MIN,
            AMOUNT_B_MIN
        );

        vm.stopPrank();
    }

    function showTokensInfo() internal {
        uint256 usdtBalance = IERC20(MY_USDT).balanceOf(MY_EOA);
        uint256 ethBalance = IERC20(MY_ETH).balanceOf(MY_EOA);
        uint256 usdtAllowance = IERC20(MY_USDT).allowance(
            MY_EOA,
            address(positionManager)
        );
        uint256 ethAllowance = IERC20(MY_ETH).allowance(
            MY_EOA,
            address(positionManager)
        );

        console2.log(
            StdStyle.magenta("================================================")
        );
        emit log_named_decimal_uint(
            "USDT balance",
            usdtBalance,
            ERC20(MY_USDT).decimals()
        );

        emit log_named_decimal_uint(
            "ETH balance",
            ethBalance,
            ERC20(MY_ETH).decimals()
        );

        emit log_named_decimal_uint(
            "USDT allowance",
            usdtAllowance,
            ERC20(MY_USDT).decimals()
        );

        emit log_named_decimal_uint(
            "ETH allowance",
            ethAllowance,
            ERC20(MY_ETH).decimals()
        );
        console2.log(
            StdStyle.magenta("================================================")
        );
    }
}
