"use client";
import React, { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Tabs, Tab } from "@nextui-org/tabs";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { User } from "@nextui-org/user";
import Link from "next/link";
import { columns } from "@/app/orders/data";
import { maxUint128 } from "viem";
import defaultProvider from "../defaultProvider";
import abiContract from "../abiContract";
const {
  abi: INonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");
import { useWalletStore } from "@/service/store";

interface Positions {
  [key: number]: UserPosition;
}

type UserPosition = {
  id: number;
  avatar: string;
  asset: string;
  type: string;
  feeBalance: string;
  orderBalance: string;
  usdBalance: string;
  link: string;
};

export default function Orders() {
  const {
    account,
    positionManagerContractAddress,
    ETHContractAddress,
  } = useWalletStore();

  const [dataOrders, setDataOrders] = useState([
    {
      id: 1,
      avatar: "/sovaOrder.jpeg",
      asset: "",
      type: "",
      feeBalance: "",
      orderBalance: "",
      usdBalance: "",
      link: "",
    },
  ]);
  type Order = typeof dataOrders[0];

  const nonfungiblePositionManager =
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
  const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";

  useEffect(() => {
    (async () => {
      dataOrders.length = 0;

      const contractView = new Contract(
        positionManagerContractAddress,
        abiContract,
        defaultProvider
      );

      const contractNonfungiblePositionManager: any = new Contract(
        nonfungiblePositionManager,
        INonfungiblePositionManagerABI,
        defaultProvider
      );

      const allPositions = await contractView.getOpenPositions(account);

      var userOrders: Positions = [];
      var newOrder: UserPosition = {
        id: 0,
        avatar: "",
        asset: "",
        type: "",
        feeBalance: "",
        orderBalance: "",
        usdBalance: "",
        link: "",
      };

      var nums: any = allPositions;
      var dataOrdersInsude: any = [];

      for (let i = 0; i < allPositions.length; i++) {
        var first: any = nums[i];
        newOrder.id = Number(i); // заполнение ордера
        const struct0 = first[0];
        const buySellString = struct0[0].toString();

        if (buySellString == "0") {
          newOrder.type = "BUY"; // заполнение ордера
        } else {
          newOrder.type = "SELL"; // заполнение ордера
        }
        const amountStart = struct0[1];
        const amountStartView = (Number(amountStart) / 10 ** 18).toFixed(2);
        newOrder.usdBalance = amountStartView; // заполнение ордера
        const addr = first[4].toString();
        const tokenIdPosition: string = struct0[2].toString();
        const linkOrder = "/orders/" + tokenIdPosition;

        // // Calculate fee
        const {
          amount0: unclaimedFee0Wei,
          amount1: unclaimedFee1Wei,
        } = await contractNonfungiblePositionManager.collect.staticCall({
          tokenId: tokenIdPosition,
          recipient: positionManagerContractAddress,
          amount0Max: maxUint128,
          amount1Max: maxUint128,
        });
        const unclaimedFee0 = (Number(unclaimedFee0Wei) / 10 ** 18)
          .toFixed(2)
          .toString();
        const unclaimedFee1 = (Number(unclaimedFee1Wei) / 10 ** 18)
          .toFixed(6)
          .toString();
        const unclaimedFeeETHUSDC =
          unclaimedFee1 + " ETH / " + unclaimedFee0 + " USDC";
        const unclaimedFeeWBTCUSDC =
          unclaimedFee1 + " WBTC / " + unclaimedFee0 + " USDC";

        // // Calculate amount
        const tickLower = first[6];
        const tickUpper = first[7];
        const liquidity = first[8];
        let sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLower)).toFixed(18); // (18)нужно вытаскивать десималс из токена
        let sqrtRatioB = Math.sqrt(1.0001 ** Number(tickUpper)).toFixed(18); // (18)нужно вытаскивать десималс из токена
        let currentTick = await contractView.getCurrentTick(
          poolAddressETH_USDC
        );
        let currentRatio = Math.sqrt(1.0001 ** Number(currentTick)).toFixed(18);
        let amount0wei = 0;
        let amount1wei = 0;
        if (currentTick <= tickLower) {
          amount0wei = Math.floor(
            Number(liquidity) *
              ((Number(sqrtRatioB) - Number(sqrtRatioA)) /
                (Number(sqrtRatioA) * Number(sqrtRatioB)))
          );
        }
        if (currentTick > tickUpper) {
          amount1wei = Math.floor(
            Number(liquidity) * (Number(sqrtRatioB) - Number(sqrtRatioA))
          );
        }
        if (currentTick >= tickLower && currentTick < tickUpper) {
          amount0wei = Math.floor(
            Number(liquidity) *
              ((Number(sqrtRatioB) - Number(currentRatio)) /
                (Number(currentRatio) * Number(sqrtRatioB)))
          );
          amount1wei = Math.floor(
            Number(liquidity) * (Number(currentRatio) - Number(sqrtRatioA))
          );
        }
        const amount0 = (amount0wei / 10 ** 18).toFixed(2).toString();
        const amount1 = (amount1wei / 10 ** 18).toFixed(6).toString();
        const amountETHUSDC = amount1 + " ETH / " + amount0 + " USDC";
        const amountWBTCUSDC = amount1 + " WBTC / " + amount0 + " USDC";
        // заполнение ордера
        if (addr == ETHContractAddress) {
          newOrder.asset = "ETH / USDC";
          newOrder.avatar = "/eth.svg";
          newOrder.feeBalance = unclaimedFeeETHUSDC;
          newOrder.orderBalance = amountETHUSDC;
          newOrder.link = linkOrder;
        } else {
          newOrder.asset = "WBTC / USDC";
          newOrder.avatar = "/btc.svg";
          newOrder.feeBalance = unclaimedFeeWBTCUSDC;
          newOrder.orderBalance = amountWBTCUSDC;
          newOrder.link = linkOrder;
        }
        dataOrdersInsude.push(
          (userOrders[Number(i)] = {
            id: Number(i),
            avatar: newOrder.avatar,
            asset: newOrder.asset,
            type: newOrder.type,
            feeBalance: newOrder.feeBalance,
            orderBalance: newOrder.orderBalance,
            usdBalance: newOrder.usdBalance,
            link: newOrder.link,
          })
        );
      }
      setDataOrders(dataOrdersInsude);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  ////////////////////////////////////

  const renderCell = React.useCallback((order: Order, columnKey: React.Key) => {
    const cellValue = order[columnKey as keyof Order];

    switch (columnKey) {
      case "asset":
        return (
          <User
            avatarProps={{ src: order.avatar }}
            description={
              <Link href={{ pathname: order.link }}>
                <div className="text-[#006FEE] text-[14px] hover:text-[#002E62] font-medium">
                  Open Order
                </div>
              </Link>
            }
            name={cellValue}
          />
        );

      case "type":
        return <p className="text-bold text-sm capitalize">{cellValue}</p>;

      case "feeBalance":
        return <p className="text-bold text-sm capitalize">{cellValue}</p>;

      case "orderBalance":
        return <p className="text-bold text-sm capitalize">{cellValue}</p>;

      case "usdBala":
        return <p className="text-bold text-sm capitalize">{cellValue}</p>;

      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <div className="flex flex-col h-screen flex flex-col items-center">
        <div className="p-[20px] xl:w-[1262px] w-11/12 border-1-solid-#3D59AD rounded-[15px] bg-[#7980A580] mt-[110px]">
          <Tabs variant="underlined" aria-label="Orders" className="w-full">
            <Tab key="active-orders" title="Active Orders">
              <Table isStriped aria-label="Active Orders Table">
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.uid}>{column.name}</TableColumn>
                  )}
                </TableHeader>
                {/* <TableBody items={orders}> */}
                <TableBody items={dataOrders}>
                  {(item) => (
                    <TableRow key={item.id}>
                      {(columnKey) => (
                        <TableCell>{renderCell(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Tab>
            <Tab key="orders-history" title="Orders History">
              <Table aria-label="Orders History Table">
                <TableHeader>
                  <TableColumn>Asset</TableColumn>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Fee Balance</TableColumn>
                  <TableColumn>Order Balance</TableColumn>
                  <TableColumn>Balance, USD</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
              </Table>
            </Tab>
          </Tabs>
        </div>
      </div>
    </>
  );
}
