// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Constants {
    uint256 internal constant USE_BLOCK = 43537896;

    address internal constant UNISWAP_V3_NPM =
        0xC36442b4a4522E871399CD717aBDD847Ab11FE88;
    address internal constant UNISWAP_V3_FACTORY =
        0x1F98431c8aD98523631AE4a59f267346ea31F984;
    address internal constant MY_EOA =
        0x42d8C4BA2f3E2c90D0a7045c25f36D67445f96b2;
    address internal constant MY_EOA_2 =
        0x8F45A43662DFdC0a25C7E84774d91F3Aa52db883;
    address internal constant MY_USDT =
        0x9EC3c43006145f5701d4FD527e826131778cA122; // USDT
    address internal constant MY_ETH =
        0xE26D5DBB28bB4A7107aeCD84d5976A06f21d8Da9; // ETH

    address internal constant UNISWAP_V3_POOL_MY_USDT_MY_ETH =
        0xeC617F1863bdC08856Eb351301ae5412CE2bf58B;

    uint24 internal constant FEE_3000 = 3000;
    int24 internal constant UNISWAP_FULL_RANGE_TICK_LOWER = -887220;
    int24 internal constant UNISWAP_FULL_RANGE_TICK_UPPER = 887220;
    uint256 internal constant AMOUNT_A_DESIRED = 10_000e16;
    uint256 internal constant AMOUNT_B_DESIRED = 10e16;
    uint256 internal constant AMOUNT_A_MIN = 0;
    uint256 internal constant AMOUNT_B_MIN = 0;

    uint160 internal constant SQRT_STOP_PRICE_X96_SELL = 2e27; // 1 ETH / 1570 USDT
    uint160 internal constant SQRT_STOP_PRICE_X96_BUY = 4e27; // 1 ETH / 392 USDT

    uint160 internal constant SQRT_CURRENT_PRICE_X96 =
        2804843978760484196155948446; // fixed price on USE_BLOCK
}
