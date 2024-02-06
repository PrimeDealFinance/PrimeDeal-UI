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
        address _uniswapFactory,
        address _wmatic,
        address _matic
    )
        PositionManager(
            _nonfungiblePositionManager,
            _uniswapFactory,
            _wmatic,
            _matic
        )
    {}

    function exposed_addLiquidity(
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
    ) external {
        return
            _addLiquidity(
                positionDirection,
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
                useTokenB,
                isNativeA,
                isNativeB
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

        positionManager = new PositionManager(
            UNISWAP_V3_NPM,
            UNISWAP_V3_FACTORY,
            WMATIC,
            MATIC
        );

        positionManagerHarness = new PositionManagerHarness(
            UNISWAP_V3_NPM,
            UNISWAP_V3_FACTORY,
            WMATIC,
            MATIC
        );
    }

    function test_getPoolAddress() public {
        address pool = positionManager.getPoolAddress(
            WMATIC,
            MY_USDT,
            FEE_3000
        );

        assertEq(pool, UNISWAP_V3_POOL_WMATIC_MY_USDT);
    }

    function test_addLiquidity() public {
        deal(WMATIC, alice, AMOUNT_A_DESIRED);
        deal(MY_USDT, alice, AMOUNT_B_DESIRED);

        vm.startPrank(alice);

        IERC20(WMATIC).approve(
            address(positionManagerHarness),
            AMOUNT_A_DESIRED
        );
        IERC20(MY_USDT).approve(
            address(positionManagerHarness),
            AMOUNT_B_DESIRED
        );

        showTokensInfo(address(positionManagerHarness));

        positionManagerHarness.exposed_addLiquidity(
            PositionManager.PositionDirection.BUY,
            WMATIC,
            MY_USDT,
            FEE_3000,
            UNISWAP_FULL_RANGE_TICK_LOWER,
            UNISWAP_FULL_RANGE_TICK_UPPER,
            AMOUNT_A_DESIRED,
            AMOUNT_B_DESIRED,
            AMOUNT_A_MIN,
            AMOUNT_B_MIN,
            true,
            true,
            false,
            false
        );

        showTokensInfo(address(positionManagerHarness));

        vm.stopPrank();
    }

    function test_pauseIsOwnable() public {
        vm.prank(bob);
        vm.expectRevert();
        (bool revertsAsExpected, ) = address(positionManager).call(
            abi.encodeWithSignature("setPause(bool)", true, msg.sender)
        );
        assertTrue(revertsAsExpected, "expectRevert: call did not revert");
    }

    function test_setPause() public {
        bool state = positionManager.paused();
        assertEq(state, false);

        positionManager.setPause(true);
        state = positionManager.paused();
        assertEq(state, true);

        positionManager.setPause(false);
        state = positionManager.paused();
        assertEq(state, false);
    }

    function test_pauseStopsOpenPosition() public {
        (bool success, ) = address(this).call(
            abi.encodeWithSignature("test_openBuyPosition()", 0, msg.sender)
        );
        assertTrue(success, "call reverted, but mustn't");

        positionManager.setPause(true);

        vm.expectRevert();
        (bool revertsAsExpected /*result of expectRevert*/, ) = address(this)
            .call(
                abi.encodeWithSignature("test_openBuyPosition()", 0, msg.sender)
            );
        assertTrue(revertsAsExpected, "expectRevert: call did not revert");
    }

    function openPosition(
        address prank,
        PositionManager.PositionDirection positionDirection,
        address tokenA,
        address tokenB,
        bool useNative
    ) public {
        vm.startPrank(prank);

        uint256 amountA = positionDirection ==
            PositionManager.PositionDirection.SELL
            ? AMOUNT_A_DESIRED
            : 0;
        uint256 amountB = positionDirection ==
            PositionManager.PositionDirection.BUY
            ? AMOUNT_B_DESIRED
            : 0;

        if (useNative) {
            deal(prank, amountA);
        } else {
            deal(tokenA, prank, amountA);
        }

        deal(tokenB, prank, amountB);

        if (positionDirection == PositionManager.PositionDirection.BUY) {
            IERC20(tokenB).approve(address(positionManager), amountB);
        } else {
            if (!useNative) {
                IERC20(tokenA).approve(address(positionManager), amountA);
            }
        }

        showTokensInfo(address(positionManager));

        assertEq(
            useNative ? prank.balance : IERC20(tokenA).balanceOf(prank),
            amountA
        );
        assertEq(IERC20(tokenB).balanceOf(prank), amountB);

        if (positionDirection == PositionManager.PositionDirection.BUY) {
            positionManager.openBuyPosition(
                tokenA,
                tokenB,
                FEE_3000,
                SQRT_STOP_PRICE_X96_BUY,
                amountB,
                0
            );
        } else {
            positionManager.openSellPosition{value: useNative ? amountA : 0}(
                tokenA,
                tokenB,
                FEE_3000,
                SQRT_STOP_PRICE_X96_SELL,
                amountA,
                0
            );
        }

        showTokensInfo(address(positionManager));

        if (positionDirection == PositionManager.PositionDirection.BUY) {
            assertEq(
                useNative ? prank.balance : IERC20(tokenA).balanceOf(prank),
                0
            );
            assertApproxEqAbs(IERC20(tokenB).balanceOf(prank), 0, 50);
        } else {
            assertApproxEqAbs(
                useNative ? prank.balance : IERC20(tokenA).balanceOf(prank),
                0,
                50
            );
            assertEq(IERC20(tokenB).balanceOf(prank), 0);
        }

        vm.stopPrank();
    }

    function openBuyPosition(
        address prank,
        address tokenA,
        address tokenB
    ) public {
        openPosition(
            prank,
            PositionManager.PositionDirection.BUY,
            tokenA,
            tokenB,
            false
        );
    }

    function openSellPosition(
        address prank,
        address tokenA,
        address tokenB
    ) public {
        openPosition(
            prank,
            PositionManager.PositionDirection.SELL,
            tokenA,
            tokenB,
            false
        );
    }

    function test_openBuyPosition() public {
        openBuyPosition(alice, WMATIC, MY_USDT);
    }

    function test_openSellPosition() public {
        openSellPosition(alice, WMATIC, MY_USDT);
    }

    function test_getCurrentSqrtPriceX96() public {
        uint160 currentSqrtPriceX96 = positionManager.getCurrentSqrtPriceX96(
            WMATIC,
            MY_USDT,
            FEE_3000
        );
        assertEq(currentSqrtPriceX96, SQRT_CURRENT_PRICE_X96);
    }

    function test_getOpenPositions() public {
        assertEq(positionManager.getOpenPositions(alice).length, 0);
        openBuyPosition(alice, WMATIC, MY_USDT);
        assertEq(positionManager.getOpenPositions(alice).length, 1);
        test_openSellPosition();
        assertEq(positionManager.getOpenPositions(alice).length, 2);
    }

    function test_NFT_mint() public {
        assertEq(positionManager.balanceOf(alice), 0);
        openBuyPosition(alice, WMATIC, MY_USDT);
        assertEq(positionManager.balanceOf(alice), 1);
    }

    function test_NFT_transfer() public {
        uint tokenId = 1;

        assertEq(positionManager.balanceOf(alice), 0);

        // internal mint NFT
        openBuyPosition(alice, WMATIC, MY_USDT);

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

        openBuyPosition(alice, WMATIC, MY_USDT);
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

        uint eventId = 18;
        assertEq(entries.length, 22);
        assertEq(entries[eventId].topics.length, 3);
        assertEq(
            entries[eventId].topics[0],
            keccak256(
                "BuyPositionOpened(uint256,address,int24,address,uint256)"
            )
        );

        uint256 tokenId = uint256(entries[eventId].topics[1]);
        console2.log(tokenId);

        vm.prank(alice);
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

        eventId = 9;
        assertEq(entries.length, 10);
        assertEq(entries[eventId].topics.length, 3);
        assertEq(
            entries[eventId].topics[0],
            keccak256("PositionClosed(uint256,address)")
        );

        assertApproxEqAbs(
            IERC20(MY_USDT).balanceOf(alice),
            AMOUNT_B_DESIRED,
            50
        );

        showTokensInfo(address(positionManager));
    }

    function test_ownerCanClosePosition() public {
        openBuyPosition(alice, WMATIC, MY_USDT);
        vm.prank(alice);
        positionManager.closePosition(1);
    }

    function test_nativeToken() public {
        openPosition(
            alice,
            PositionManager.PositionDirection.SELL,
            MATIC,
            MY_USDT,
            true
        );
        vm.prank(alice);
        positionManager.closePosition(1);

        assertApproxEqAbs(alice.balance, AMOUNT_A_DESIRED, 50);

        showTokensInfo(address(positionManager));
    }

    function showTokensInfo(address /*spender*/) internal {
        console2.log(
            StdStyle.magenta("================================================")
        );
        emit log_named_decimal_uint("MATIC balance", alice.balance, 18);

        emit log_named_decimal_uint(
            "WMATIC balance",
            IERC20(WMATIC).balanceOf(alice),
            ERC20(WMATIC).decimals()
        );

        emit log_named_decimal_uint(
            "USDT balance",
            IERC20(MY_USDT).balanceOf(alice),
            ERC20(MY_USDT).decimals()
        );

        console2.log(
            StdStyle.magenta("================================================")
        );
    }
}
