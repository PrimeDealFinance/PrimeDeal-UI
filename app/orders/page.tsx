"use client";
import { useEffect, useState } from 'react';
import { Contract, ethers } from "ethers";
import { maxUint128 } from "viem";
import dynamic from 'next/dynamic';
import { useWalletStore } from '@/service/store';
import defaultProvider from "../provider/defaultProvider";
import abiContract from '@/components/abiContract';
import { ProtectedRoute, TableOrders, Spinner } from '@/components';
import { abi as INonfungiblePositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json";
import { PositionInfo, Positions, UserPosition } from "../types";
import "@/app/font.css"


const nonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";

// TODO - config path for get assets from github
const PATH_TO_ASSETS = 'https://raw.githubusercontent.com/PrimeDealFinance/PrimeDeal-UI/main/public';
// const PATH_TO_ASSETS = '';

const ERC20_ABI = [
  "function symbol() public view returns (string)",
];

const TEXT_ORDERS = {
  title: 'My orders'
}

function Orders() {
  const {
    account,
    positionManagerContractAddress,
    
    USDTContractAddress,
    ETHContractAddress,
  } = useWalletStore();

  const [loading, setLoading] = useState(true);
  const [dataOrders, setDataOrders] = useState<UserPosition[]>([]);
  // type Order = typeof dataOrders[0];
  const contractProvider = new ethers.Contract(
    positionManagerContractAddress,
    abiContract,
    defaultProvider
  );

  useEffect(() => {
    (async () => {

      // try {
      async function getTickerForAddress(
        address: string,
        abi: string[],
        provider: ethers.JsonRpcApiProvider,) {
        return await (new Contract(address, abi, defaultProvider)).symbol();
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
      
      if (!allPositions.length) {
        setLoading(false);
      }

      allPositions.forEach(async (position: Positions, index: number) => {
        const positionItem: UserPosition = {
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
        
        const tokenIdPosition: string = positionInfo.uniswapTokenId.toString();
        const id721: string = await contractView.tokenOfOwnerByIndex(account, index);
        const linkOrder = "/orders/" + id721;
        //const tokenIdPosition = id721.toString();
        

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
        let pool = await contractProvider.getPoolAddress(
          USDTContractAddress,
          ETHContractAddress,
          3000 // TODO: make changable
        );
        let currentTick = await contractProvider.getCurrentTick(
          pool
        );
        const unclaimedTokensText = `${unclaimedFee0} ${tickerForToken0.toLocaleUpperCase()} / ${unclaimedFee1} ${tickerForToken1.toLocaleUpperCase()}`;

        const tickLower = Number(position.tickLower);
        const tickUpper = Number(position.tickUpper);
        const liquidity = Number(position.liquidity);

        const sqrtRatioA = Number(Math.sqrt(1.0001 ** Number(tickLower)).toFixed(18)); // (18)нужно вытаскивать десималс из токена
        const sqrtRatioB = Number(Math.sqrt(1.0001 ** Number(tickUpper)).toFixed(18)); // (18)нужно вытаскивать десималс из токена

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
        const amount1 = (amount1wei / 10 ** 18).toFixed(2).toString();

        const amountTicker1divTicker0 = `${amount0} ${tickerForToken0} / ${amount1} ${tickerForToken1}`;


        positionItem.asset = `${tickerForToken0.toUpperCase()}/${tickerForToken1.toUpperCase()}`;
        positionItem.avatar = `${PATH_TO_ASSETS}/${tickerForToken0.toLowerCase()}.svg`;

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
        {loading  ? (
          <Spinner />
        ) : (
          <TableOrders loading={loading} orders={dataOrders}/>
        )}
      </div>
    </div>
  );
}

export default ProtectedRoute(Orders);
