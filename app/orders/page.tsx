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
import { Contract, ethers } from "ethers";
import { maxUint128 } from "viem";
import ProtectedRoute from "@/components/ProtectedRoute";
import { abi as INonfungiblePositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json";
import { Spinner } from "@/components/Spinner/Spinner";
import './index.css'

const nonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";

// TODO - config path for get assets from github
const PATH_TO_ASSETS = 'https://raw.githubusercontent.com/PrimeDealFinance/PrimeDeal-UI/main/public';
// const PATH_TO_ASSETS = '';

const ERC20_ABI = [
  "function name() public view returns (string)",
];

interface IUserPosition {
  id: number | string;
  avatar: string;
  asset: string;
  type: string;
  link: string;
  feeBalance: string;
  orderBalance: string;
  usdBalance: string;
};
interface PositionInfo {
  positionDirection: BigInt | boolean;
  amount: BigInt;
  uniswapTokenId: BigInt;
}

interface Positions {
  pos: PositionInfo;
  nonce: BigInt;
  operator: string;
  token0: string;
  token1: string;
  fee: BigInt;
  tickLower: BigInt;
  tickUpper: BigInt;
  liquidity: BigInt;
  feeGrowthInside0LastX128: BigInt;
  feeGrowthInside1LastX128: BigInt;
  tokensOwed0: BigInt;
  tokensOwed1: BigInt;
}

const TEXT_ORDERS = {
  title: 'My orders'
}

function Orders() {
  const {
    account,
    positionManagerContractAddress,
    ETHContractAddress,
  } = useWalletStore();
  const [loading, setLoading] = useState(true);
  const [dataOrders, setDataOrders] = useState<IUserPosition[]>([]);
  // type Order = typeof dataOrders[0];

  useEffect(() => {
    (async () => {

      // try {
      async function getTickerForAddress(
        address: string,
        abi: string[],
        provider: ethers.JsonRpcApiProvider,) {
        return await (new Contract(address, abi, defaultProvider)).name();
      }

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

      const allPositions: Positions[] = await contractView.getOpenPositions(account);

      allPositions.forEach(async (position: Positions, index: number) => {
        const positionItem: IUserPosition = {
          id: index,
          avatar: "",
          asset: "",
          type: "",
          feeBalance: "",
          orderBalance: "",
          usdBalance: "",
          link: ""
        }

        /// @dev Get ticker from contract ERC-20 address
        const tickerForToken0: string = await getTickerForAddress(position.token0, ERC20_ABI, defaultProvider);
        const tickerForToken1: string = await getTickerForAddress(position.token1, ERC20_ABI, defaultProvider);

        positionItem.id = index;

        /// @dev - return tupple from contract data. { positionDirection, amount, uniswapTokenId: }
        const positionInfo: PositionInfo = position.pos;
        positionItem.type = positionInfo.positionDirection.toString() === "0" ? "Buy" : "Sell";
        positionItem.usdBalance = (
          (Number(positionInfo.amount) / 10 ** 18).toFixed(2)
        );

        const id721: string = await contractView.tokenOfOwnerByIndex(account, index);
        const linkOrder = "/orders/" + id721;
        const tokenIdPosition = id721.toString();

        // ?
        const {
          amount0: unclaimedFee0Wei,
          amount1: unclaimedFee1Wei,
        } =
          await contractNonfungiblePositionManager.collect.staticCall({
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

        // format: ETH / USDT
        const unclaimedTokensText = `${unclaimedFee1} ${tickerForToken1.toLocaleUpperCase()} / ${unclaimedFee0} ${tickerForToken0.toLocaleUpperCase()}`;

        const tickLower = Number(position.tickLower);
        const tickUpper = Number(position.tickUpper);
        const liquidity = Number(position.liquidity);

        const sqrtRatioA = Number(Math.sqrt(1.0001 ** Number(tickLower)).toFixed(18)); // (18)нужно вытаскивать десималс из токена
        const sqrtRatioB = Number(Math.sqrt(1.0001 ** Number(tickUpper)).toFixed(18)); // (18)нужно вытаскивать десималс из токена
        const currentTick = await contractView.getCurrentTick(poolAddressETH_USDC);

        let currentRatio = Number(Math.sqrt(1.0001 ** Number(currentTick)).toFixed(18));

        let amount0wei = 0;
        let amount1wei = 0;
        if (currentTick <= tickLower) {
          amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
        }

        if (currentTick > tickUpper) {
          amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
        }

        if (currentTick >= tickLower && currentTick < tickUpper) {
          amount0wei = Math.floor(liquidity * ((sqrtRatioB - currentRatio) / (currentRatio * sqrtRatioB)));
          amount1wei = Math.floor(liquidity * (currentRatio - sqrtRatioA));
        }

        const amount0 = (amount0wei / 10 ** 18).toFixed(2).toString();
        const amount1 = (amount1wei / 10 ** 18).toFixed(6).toString();

        const amountTicker1divTicker0 = `${amount1} ${tickerForToken1} / ${amount0} ${tickerForToken0}`;


        positionItem.asset = `${tickerForToken1.toUpperCase()}/${tickerForToken0.toUpperCase()}`;
        positionItem.avatar = `${PATH_TO_ASSETS}/${tickerForToken1.toLowerCase()}.svg`;

        positionItem.feeBalance = unclaimedTokensText;
        positionItem.orderBalance = amountTicker1divTicker0;
        positionItem.link = linkOrder;

        dataOrders.push(positionItem);
        setDataOrders([...dataOrders]);
        setLoading(false);
      }) 
    })();
  }, [])

  return (
    <div className="mt-[180px] h-screen flex flex-col items-center z-10 mb-20">
      <div className="xl:w-[1200px] w-11/12">
        <h1 className="self-start text-3xl font-bold font-['GothamPro']">{TEXT_ORDERS.title}</h1>
        {loading ? (
          <Spinner />
        ) : (
          <Sheet color="primary" className={`p-5 mt-5 rounded-3xl ${loading ? 'hidden' : 'visible'}`}>
            <Table variant="plain" sx={{ fontFamily: 'GothamPro' }}>
              <thead>
                <tr>
                  {COLUMNS.map((column) => (
                    <th key={column.uid}>{column.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(dataOrders.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={row.link} className="flex items-center">
                        <Avatar alt="Avatar" src={row.avatar} className="mr-3" />
                        <span>{row.asset}</span>
                      </Link>
                    </td>
                    <td className={row.type === 'Sell' ? 'text-[#EF3131]' : 'text-[#6FEE8E]'}>{row.type}</td>
                    <td>{row.feeBalance}</td>
                    <td>{row.orderBalance}</td>
                    <td>{row.usdBalance}</td>
                  </tr>
                )))}
              </tbody>
            </Table>
          </Sheet>
        )}
      </div>
    </div>
  );
}

export default ProtectedRoute(Orders)
