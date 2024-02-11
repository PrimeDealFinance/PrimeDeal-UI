"use client";
import Link from "next/link";
import Table from '@mui/joy/Table';
import Avatar from '@mui/joy/Avatar';
import Sheet from '@mui/joy/Sheet';
import { COLUMNS } from "@/app/orders/COLUMNS";
import { useWalletStore } from '@/service/store';
import { useEffect, useState } from 'react';
import abiContract from '@/components/abiContract';
import defaultProvider from "../provider/defaultProvider";
import { Contract, parseEther, formatEther, ethers } from "ethers";
import { maxUint128 } from "viem";

const nonfungiblePositionManager  = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";


const {
  abi: INonfungiblePositionManagerABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");

type Balance = string; // TODO - rebuild to bigint
interface IBalance {
  feeBalance: Balance;
  orderBalance: Balance;
  usdBalance: Balance;
}

type Key = number | string;
interface IUserPosition {
  id: Key;
  avatar: string;
  asset: string;
  type: string;
  balance: IBalance;
  link: string;
};

type TPositionDirection = BigInt | boolean; // This is a parameter need make as bool!
type TAmount = BigInt;
type TUniswapTokenId = BigInt;
interface IPositionInfo {
  positionDirection: TPositionDirection;
  amount: TAmount;
  uniswapTokenId: TUniswapTokenId;
}

interface Positions {
  [key: number]: IUserPosition;
}

/////////////////////////////////////////
/// Placeholder start
/////////////////////////////////////////
const balance: IBalance = {
  feeBalance:   "0.270000 ETH / 0.00 USDC",
  orderBalance: "0.000000 ETH / 1.00 USDC",
  usdBalance:   "5 690 USDC"
}
const DATA_FOR_TEST: IUserPosition[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  avatar: "/solidity.svg",
  asset: "ETH",
  type: index % 2 === 0 ? "Buy" : "Sell",
  balance,
  link: "#",
}));
/////////////////////////////////////////
/// Placeholder end
/////////////////////////////////////////

const TEXT_ORDERS = {
  title: 'My orders'
}

export default function Orders() {
  const {
    account,
    positionManagerContractAddress,
    ETHContractAddress,
  } = useWalletStore();
  
  const [dataOrders, setDataOrders] = useState<IUserPosition[]>([{
    id: 1,
    avatar: "/sovaOrder.jpeg",
    asset: "",
    type: "",
    balance: { feeBalance: "", orderBalance: "", usdBalance: "" },
    link: ""
  }]);
  type Order = typeof dataOrders[0];

  useEffect(() => {
    return () => {
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
        const userOrders: Positions = [];
        
        allPositions.forEach(async (position: IUserPosition[], index: Key) => {
          const positionItem: IUserPosition = {
            id: 0,
            avatar: "",
            asset: "",
            type: "",
            balance: { feeBalance: "", orderBalance: "", usdBalance: "" },
            link: ""
          }
          
          positionItem.id = index;

          const positionInfo: IPositionInfo = position['pos']; // returned object {Buy\sel amount token-id}

          positionItem.type = positionInfo.positionDirection.toString() === "0" ? "Buy" : "Sell";
          positionItem.balance.usdBalance = (
            (Number(positionInfo.amount) / 10 ** 18).toFixed(2)
          );
          
          const id721: string = await contractView.tokenOfOwnerByIndex(account, index);
          const linkOrder = "/orders/" + id721;
          const tokenIdPosition = id721.toString();
          
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
          const unclaimedFeeETHUSDC = unclaimedFee1 + " ETH / " + unclaimedFee0 + " USDC";
          const unclaimedFeeWBTCUSDC = unclaimedFee1 + " WBTC / " + unclaimedFee0 + " USDC";
          
          const tickLower = position['tickLower'];
          const tickUpper = position['tickUpper'];
          const liquidity = position['liquidity'];
          
          const sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLower)).toFixed(18); // (18)нужно вытаскивать десималс из токена
          const sqrtRatioB = Math.sqrt(1.0001 ** Number(tickUpper)).toFixed(18); // (18)нужно вытаскивать десималс из токена
          const currentTick = await contractView.getCurrentTick(poolAddressETH_USDC);

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

            amount1wei = Math.floor( Number(liquidity) * (Number(currentRatio) - Number(sqrtRatioA)));
          }
          
          const amount0 = (amount0wei / 10 ** 18).toFixed(2).toString();
          const amount1 = (amount1wei / 10 ** 18).toFixed(6).toString();
          const amountETHUSDC = amount1 + " ETH / " + amount0 + " USDC";
          const amountWBTCUSDC = amount1 + " WBTC / " + amount0 + " USDC";

          // TODO describe position!!!!
          if (Array(positionItem)['token0'] === ETHContractAddress) {
            positionItem.asset = "ETH / USDC";
            positionItem.avatar = "/eth.svg";
            positionItem.balance.feeBalance = unclaimedFeeETHUSDC;
            positionItem.balance.orderBalance = amountETHUSDC;
            positionItem.link = linkOrder;
        } else {
            positionItem.asset = "WBTC / USDC";
            positionItem.avatar = "/btc.svg";
            positionItem.balance.feeBalance = unclaimedFeeWBTCUSDC;
            positionItem.balance.orderBalance = amountWBTCUSDC;
            positionItem.link = linkOrder;
          }
          
          dataOrders.push(positionItem);
          setDataOrders([...dataOrders]);

        })          
       })();
    };
  }, [])

  return (
    <div className="mt-[180px] h-screen flex flex-col items-center z-10 mb-20">
      <div className="xl:w-[1200px] w-11/12">
        <h1 className="self-start text-3xl font-bold">{TEXT_ORDERS.title}</h1>
        <Sheet color="primary" className="p-5 mt-5 rounded-3xl">
          <Table variant="plain">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.uid}>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {
                dataOrders.map((row) => (
                <tr key={row.id} >
                  <td>
                    <Link href={row.link} className="flex items-center">
                      <Avatar alt="Avatar" src={row.avatar} className="mr-3" />
                      <span>{row.asset}</span>
                    </Link>
                  </td>
                  <td className={row.type === 'Sell' ? 'text-[#EF3131]' : 'text-[#6FEE8E]'}>{row.type}</td>
                  <td>{row.balance.feeBalance}</td>
                  <td>{row.balance.orderBalance}</td>
                  <td>{row.balance.usdBalance}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </div>
    </div>
  );
}
