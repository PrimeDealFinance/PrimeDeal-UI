// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import {Test, console2, StdStyle, Vm} from "forge-std/Test.sol";
import {PositionManager} from "../src/PositionManager.sol";
import {Constants} from "./Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PositionManagerHarness is PositionManager, Constants {
    constructor(
        address _nonfungiblePositionManager,
        address _uniswapFactory
    ) PositionManager(_nonfungiblePositionManager, _uniswapFactory) {}

    function exposed_addLiquidity(
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
    ) external returns (uint256 _tokenId) {
        return
            _addLiquidity(
                tokenA,
                tokenB,
                fee,
                tickLower,
                tickUpper,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                useTokenA,
                useTokenB
            );
    }
}

contract PositionManagerTest is Test, Constants {
    PositionManager public positionManager;
    PositionManagerHarness public positionManagerHarness;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        vm.createSelectFork(vm.envString("MUMBAI_RPC_URL"), USE_BLOCK);
        vm.startPrank(MY_EOA);

        positionManager = new PositionManager(
            UNISWAP_V3_NPM,
            UNISWAP_V3_FACTORY
        );

        positionManagerHarness = new PositionManagerHarness(
            UNISWAP_V3_NPM,
            UNISWAP_V3_FACTORY
        );

        vm.stopPrank();
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

    function test_addLiquidity() public {
        vm.startPrank(MY_EOA);

        deal(MY_USDT, MY_EOA, AMOUNT_A_DESIRED);
        deal(MY_ETH, MY_EOA, AMOUNT_B_DESIRED);

        IERC20(MY_USDT).approve(
            address(positionManagerHarness),
            AMOUNT_A_DESIRED
        );
        IERC20(MY_ETH).approve(
            address(positionManagerHarness),
            AMOUNT_B_DESIRED
        );

        showTokensInfo(address(positionManagerHarness));

        positionManagerHarness.exposed_addLiquidity(
            MY_USDT,
            MY_ETH,
            FEE_3000,
            UNISWAP_FULL_RANGE_TICK_LOWER,
            UNISWAP_FULL_RANGE_TICK_UPPER,
            AMOUNT_A_DESIRED,
            AMOUNT_B_DESIRED,
            AMOUNT_A_MIN,
            AMOUNT_B_MIN,
            true,
            true
        );

        vm.stopPrank();
    }

    function test_pauseIsOwnable() public {
        vm.expectRevert();
        (bool revertsAsExpected, ) = address(positionManager).call(
            abi.encodeWithSignature("setPause(bool)", true, msg.sender)
        );
        assertTrue(revertsAsExpected, "expectRevert: call did not revert");
    }

    function test_setPause() public {
        bool state;

        vm.startPrank(MY_EOA);

        state = positionManager.paused();
        assertEq(state, false);

        positionManager.setPause(true);
        state = positionManager.paused();
        assertEq(state, true);

        positionManager.setPause(false);
        state = positionManager.paused();
        assertEq(state, false);

        vm.stopPrank();
    }

    function test_pauseStopsOpenPosition() public {
        openBuyPosition(MY_EOA);

        vm.startPrank(MY_EOA);
        positionManager.setPause(true);
        vm.stopPrank();

        vm.expectRevert();
        (bool revertsAsExpected, ) = address(this).call(
            abi.encodeWithSignature("test_openPosition()", 0, msg.sender)
        );
        assertTrue(revertsAsExpected, "expectRevert: call did not revert");
    }

    function openBuyPosition(address prank) public {
        vm.startPrank(prank);

        deal(MY_USDT, prank, AMOUNT_A_DESIRED);
        deal(MY_ETH, prank, 0);

        IERC20(MY_USDT).approve(address(positionManager), AMOUNT_A_DESIRED);

        showTokensInfo(address(positionManager));
        uint256 usdtBalance = IERC20(MY_USDT).balanceOf(prank);
        uint256 ethBalance = IERC20(MY_ETH).balanceOf(prank);
        assertEq(usdtBalance, AMOUNT_A_DESIRED);
        assertEq(ethBalance, 0);

        positionManager.openBuyPosition(
            MY_USDT,
            MY_ETH,
            FEE_3000,
            SQRT_STOP_PRICE_X96_BUY,
            AMOUNT_A_DESIRED,
            AMOUNT_A_MIN
        );

        showTokensInfo(address(positionManager));
        usdtBalance = IERC20(MY_USDT).balanceOf(prank);
        ethBalance = IERC20(MY_ETH).balanceOf(prank);
        assertEq(usdtBalance, 4);
        assertEq(ethBalance, 0);

        vm.stopPrank();
    }

    function test_openBuyPosition() public {
        openBuyPosition(MY_EOA);
    }

    function test_openSellPosition() public {
        vm.startPrank(MY_EOA);

        deal(MY_USDT, MY_EOA, 0);
        deal(MY_ETH, MY_EOA, AMOUNT_B_DESIRED);

        IERC20(MY_ETH).approve(address(positionManager), AMOUNT_B_DESIRED);

        showTokensInfo(address(positionManager));
        uint256 usdtBalance = IERC20(MY_USDT).balanceOf(MY_EOA);
        uint256 ethBalance = IERC20(MY_ETH).balanceOf(MY_EOA);
        assertEq(usdtBalance, 0);
        assertEq(ethBalance, AMOUNT_B_DESIRED);

        positionManager.openSellPosition(
            MY_USDT,
            MY_ETH,
            FEE_3000,
            SQRT_STOP_PRICE_X96_SELL,
            AMOUNT_B_DESIRED,
            AMOUNT_B_MIN
        );

        showTokensInfo(address(positionManager));
        usdtBalance = IERC20(MY_USDT).balanceOf(MY_EOA);
        ethBalance = IERC20(MY_ETH).balanceOf(MY_EOA);
        assertEq(usdtBalance, 0);
        assertEq(ethBalance, 0);

        vm.stopPrank();
    }

    function test_getCurrentSqrtPriceX96() public {
        uint160 currentSqrtPriceX96 = positionManager.getCurrentSqrtPriceX96(
            MY_USDT,
            MY_ETH,
            FEE_3000
        );
        assertEq(currentSqrtPriceX96, SQRT_CURRENT_PRICE_X96);
    }

    function test_getOpenPositions() public {
        assertEq(positionManager.getOpenPositions(MY_EOA).length, 0);
        openBuyPosition(MY_EOA);
        assertEq(positionManager.getOpenPositions(MY_EOA).length, 1);
        test_openSellPosition();
        assertEq(positionManager.getOpenPositions(MY_EOA).length, 2);
    }

    function test_NFT_mint() public {
        assertEq(positionManager.balanceOf(MY_EOA), 0);
        openBuyPosition(MY_EOA);
        assertEq(positionManager.balanceOf(MY_EOA), 1);
    }

    function test_NFT_transfer() public {
        uint tokenId = 1;

        assertEq(positionManager.balanceOf(alice), 0);

        // internal mint NFT
        openBuyPosition(alice);

        assertEq(positionManager.balanceOf(alice), 1);
        assertEq(positionManager.ownerOf(tokenId), alice);

        vm.prank(alice);
        positionManager.approve(bob, tokenId);

        vm.prank(bob);
        positionManager.transferFrom(alice, bob, tokenId);

        assertEq(positionManager.balanceOf(alice), 0);
        assertEq(positionManager.getOpenPositions(alice).length, 0);

        assertEq(positionManager.ownerOf(tokenId), bob);
        assertEq(positionManager.balanceOf(bob), 1);
        assertEq(positionManager.getOpenPositions(bob).length, 1);
    }

    function test_closePosition() public {
        vm.recordLogs();

        openBuyPosition(MY_EOA);
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // keep it for entries logging
        /*
        for (uint i = 0; i < entries.length; i++) {
            console2.log(StdStyle.magenta(i));
            assertEq(
                entries[i].topics[0],
                keccak256(
                    "BuyPositionOpened(uint256,address,int24,address,uint256)"
                )
            );
        }
        */

        assertEq(entries.length, 23);
        assertEq(entries[18].topics.length, 3);
        assertEq(
            entries[18].topics[0],
            keccak256(
                "BuyPositionOpened(uint256,address,int24,address,uint256)"
            )
        );

        uint256 tokenId = uint256(entries[18].topics[1]);
        positionManager.closePosition(tokenId);
        entries = vm.getRecordedLogs();

        // keep it for entries logging
        /*
        for (uint i = 0; i < entries.length; i++) {
            console2.log(StdStyle.magenta(i));
            assertEq(
                entries[i].topics[0],
                keccak256("PositionClosed(uint256,address)")
            );
        }
        */

        assertEq(entries.length, 9);
        assertEq(entries[8].topics.length, 3);
        assertEq(
            entries[8].topics[0],
            keccak256("PositionClosed(uint256,address)")
        );
    }

    function showTokensInfo(address spender) internal {
        uint256 usdtBalance = IERC20(MY_USDT).balanceOf(MY_EOA);
        uint256 ethBalance = IERC20(MY_ETH).balanceOf(MY_EOA);
        uint256 usdtAllowance = IERC20(MY_USDT).allowance(MY_EOA, spender);
        uint256 ethAllowance = IERC20(MY_ETH).allowance(MY_EOA, spender);

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
