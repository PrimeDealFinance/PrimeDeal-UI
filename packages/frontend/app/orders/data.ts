import React from "react";



const columns = [
    {name: "Asset", uid: "asset"},
    {name: "Type", uid: "type"},
    {name: "Fee Balance", uid: "feeBalance"},
    {name: "Order Balance", uid: "orderBalance"},
    {name: "Balance, USD", uid: "usdBalance"},
  ];

  const orders = [
    {   
        id:1,
        "avatar": "/btc.svg",       
        "asset": "BTC / USDC",
        "type": "BUY",
        "feeBalance": "0.001 BTC / 100 USDC",
        "orderBalance": "0.12 BTC / 900 USDC",
        "usdBalance": "4356$",
        "link": "/orders/example/btc"

    },

    {   
        id:2,
        "avatar": "/eth.svg",       
        "asset": "ETH / USDC",
        "type": "SELL",
        "feeBalance": "0.2 ETH / 212 USDC",
        "orderBalance": "2.45 ETH / 2301 USDC",
        "usdBalance": "10203$",
        "link": "/orders/example/eth"
    },
  ]

  export {columns, orders};