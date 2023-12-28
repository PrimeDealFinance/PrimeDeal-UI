// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Constants {
    uint256 internal constant USE_BLOCK = 44033909;

    address internal constant UNISWAP_V3_NPM =
        0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
    address internal constant UNISWAP_V3_FACTORY =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address internal constant WMATIC =
        0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889;
    address internal constant MY_EOA =
        0x42d8C4BA2f3E2c90D0a7045c25f36D67445f96b2;
    address internal constant MY_USDT =
        0x9EC3c43006145f5701d4FD527e826131778cA122;

    address internal constant UNISWAP_V3_POOL_WMATIC_MY_USDT =
        0x680752645E785B727E9E6Bf1D9d21C5F56175096;

    uint24 internal constant FEE_3000 = 3000;
    int24 internal constant UNISWAP_FULL_RANGE_TICK_LOWER = -887220;
    int24 internal constant UNISWAP_FULL_RANGE_TICK_UPPER = 887220;
    uint256 internal constant AMOUNT_A_DESIRED = 100e15;
    uint256 internal constant AMOUNT_B_DESIRED = 100e18;
    uint256 internal constant AMOUNT_A_MIN = (AMOUNT_A_DESIRED * 8) / 10;
    uint256 internal constant AMOUNT_B_MIN = (AMOUNT_B_DESIRED * 8) / 10;

    uint160 internal constant SQRT_STOP_PRICE_X96_SELL =
        SQRT_CURRENT_PRICE_X96 * 2;
    uint160 internal constant SQRT_STOP_PRICE_X96_BUY =
        SQRT_CURRENT_PRICE_X96 / 2;

    uint160 internal constant SQRT_CURRENT_PRICE_X96 =
        2505413655765166104103837312489; // fixed price on USE_BLOCK
}
