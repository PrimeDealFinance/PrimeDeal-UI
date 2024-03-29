"use client";
import React, { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Chip from '@mui/joy/Chip';
import TradingViewWidget from "@/service/TradingView";
import ETH from "@/public/eth.svg";
import MATIC from "@/public/wmatic.svg";
import WBTC from "@/public/btc.svg";
import USDC from "@/public/usdc.svg";
import Image from "next/image";
import Avatar from "@mui/joy/Avatar";
import { ethers, Contract } from "ethers";
import defaultProvider from "../../provider/defaultProvider";
import abiContract from "../../../components/abiContract";
import { maxUint128 } from "viem";
import {ProtectedRoute} from "@/components";
import { useWalletStore } from "@/service/store";
import "@/app/font.css";
import ModalTsxInprogress from "../../../components/ModalTsxInpogress";
import AlertError from "../../../components/AlertError";

const {
    abi: INonfungiblePositionManagerABI,
  } = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json");


function OrderIdPage({ params }: { params: { id: string } }) {
    const {
      account,
      positionManagerContractAddress,
      USDTContractAddress,
      ETHContractAddress,
      contractSigner,
      reinitializeContracts
    } = useWalletStore();

    const [nameOrder, setNameOrder] = useState<string>("");
    const [isOpenModalTx, setIsOpenModalTx] = React.useState<boolean>(false);
    const [isOpenAlertError, setIsOpenAlertError] = React.useState<boolean>(false);
    const [txhash, setTxhash] = useState("");
    const miniTxhash = txhash.substring(0, 5) + "....." + txhash.slice(45);
    const hashLink = process.env.NEXT_PUBLIC_HASH_LINK_MUMBAI;
    const hashLinkPlus = hashLink + txhash;
    const [inRange, setInRange] = useState<string>("");
    const [colorRange, setColorRange] = useState<string>("");
    const [ETH_WBTC, setETH_WBTC] = useState<string>("");
    const [iconETH_WBTC, setIconETH_WBTC] = useState<any>(ETH);
    const [amountUSDC, setAmountUSDC] = useState<string>("");
    const [amountETH_WBTC, setAmountETH_WBTC] = useState<string>("");
    const [feeUSDC, setFeeUSDC] = useState<string>("");
    const [feeETH_WBTC, setFeeETH_WBTC] = useState<string>("");
    const [balanceDollars, setBalanceDollars] = useState<string>("");
    const [feeDollars, setFeeDollars] = useState<string>("");
    const [priceView, setPriceView] = useState<string>("");
    const nonfungiblePositionManager =
      "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
   // const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";
    const [paramsId, setParamsId] = useState<string>("");
    const [halfPrice, setHalfPrice] = useState<number>(0);
    const [colorDot, setColorDot] = useState<string>("");
    const [share0, setShare0] = useState<string>("");
    const [share1, setShare1] = useState<string>("");
    const [ratioAPrice, setRatioAPrice] = useState<string>("");
    const [ratioBPrice, setRatioBPrice] = useState<string>("");
    const [middlePurchase, setMiddlePurchase] = useState<string>("");

    useEffect(() => {
      reinitializeContracts();
    }, []);
  
    const closePositionId = async() => {
      try {
      const tx = await contractSigner.closePosition(params.id,
        {
          gasLimit: 850000,
        });
      
        setTxhash(tx.hash);
        setIsOpenModalTx(true);
        const response = await tx.wait();
        setIsOpenModalTx(false);
        console.log("responseTxSwap1: ", response);
        window.location.replace("/orders");
    } catch (error) {
        setIsOpenModalTx(false);
        setIsOpenAlertError(true);
        console.error(error);
      }
    }

    const claimFees = async() => {
        try {
          const tx = await contractSigner.collect(params.id,
          {
            gasLimit: 850000,
          });
          setTxhash(tx.hash);
          setIsOpenModalTx(true);
          const response = await tx.wait();
          setIsOpenModalTx(false);
          console.log("responseTxSwap1: ", response);
          window.location.replace("/orders");
      } catch (error) {
        setIsOpenModalTx(false);
        setIsOpenAlertError(true);
        console.error(error);
        }
      }
  
    useEffect(() => {
      (async () => {
        setParamsId(params.id);
        const contractProvider = new ethers.Contract(
          positionManagerContractAddress,
          abiContract,
          defaultProvider
        ); // это можно сделать в глобале
  
        const contractNonfungiblePositionManager: any = new Contract(
          nonfungiblePositionManager,
          INonfungiblePositionManagerABI,
          defaultProvider
        );
  
        const allPositions = await contractProvider.getOpenPositions(account);
  
        // const sqrtPriceX96EthUsdt = await contractProvider.getCurrentSqrtPriceX96(
        //   ETHContractAddress,
        //   USDTContractAddress,
        //   "3000"
        // );

        let pool = await contractProvider.getPoolAddress(
          USDTContractAddress,
          ETHContractAddress,
          3000 // TODO: make changable
        );
        let currentTick = await contractProvider.getCurrentTick(
          pool
        );
        const priceUSDC_ETH = Number((1.0001 ** Number(currentTick)).toFixed(18));
        // = ((+currentRatioPrice).toFixed(2).toString());

        //const priceUSDC_ETH = (Number(sqrtPriceX96EthUsdt) ** 2 / 2 ** 192);
        // ещё нужен прайс для битка тут
  
        var nums: any = allPositions;
  
        for (let i = 0; i < allPositions.length; i++) {
          var first: any = nums[i];
          const struct0 = first[0];

          const tokenIdPositionForCount = struct0[1].toString();

          const buySellString = struct0[2].toString();
          const addr = first[3].toString();
          const id721 = await contractProvider.tokenOfOwnerByIndex(account, i);
          const tokenIdPosition: string = id721.toString();
          //установка заголовка ордера
          if (tokenIdPosition == params.id) {
            if (buySellString == "0" && addr == ETHContractAddress) {
             // setNameOrder("BUY ETH / USDC"); // заполнение ордера
              setETH_WBTC("MATIC ");
              setIconETH_WBTC(MATIC);
            } else if (buySellString == "1" && addr == ETHContractAddress) {
             // setNameOrder("SELL ETH / USDC"); // заполнение ордера
              setETH_WBTC("MATIC ");
              setIconETH_WBTC(MATIC);
            } else if (buySellString == "0" && addr != ETHContractAddress) {
             // setNameOrder("BUY WBTC / USDC");
              setETH_WBTC("WBTC ");
              setIconETH_WBTC(WBTC);
            } else if (buySellString == "1" && addr != ETHContractAddress) {
             // setNameOrder("SELL WBTC / USDC");
              setETH_WBTC("WBTC ");
              setIconETH_WBTC(WBTC);
            }
            //установка в рэнже или нет
            let poolAddressETH_USDC = await contractProvider.getPoolAddress(
              USDTContractAddress,
              ETHContractAddress,
              3000 // TODO: make changable
            );
            let currentTick = await contractProvider.getCurrentTick(
              poolAddressETH_USDC
            );
            const tickLower = first[6];
            const tickUpper = first[7];
            const share0 = ((Number(tickUpper) - Number(currentTick))) / (((Number(tickUpper) - Number(tickLower))) / 100);
            const share1 = 100 - share0;
            if (currentTick > tickLower && currentTick < tickUpper) {
              setInRange("In range");
              setColorRange("#6FEE8E");
              setColorDot('/greenDot.svg');
              setShare0(share0.toFixed(2).toString());
              setShare1(share1.toFixed(2).toString());
            } else {
              setInRange("Out of range"); 
              setColorRange("#e73326");
              setColorDot('/redDot.svg');
              if(currentTick < tickLower){
                setShare0("100");
                setShare1("0");
              } else {
                setShare0("0");
                setShare1("100");
              }
            }
  
            // // Calculate fee
            const {
              amount0: unclaimedFee0Wei,
              amount1: unclaimedFee1Wei,
            } = await contractNonfungiblePositionManager.collect.staticCall({
              tokenId: tokenIdPositionForCount,
              recipient: positionManagerContractAddress,
              amount0Max: maxUint128,
              amount1Max: maxUint128,
            });
            const unclaimedFee0 = (Number(unclaimedFee0Wei) / 10 ** 18)
              .toFixed(6)
              .toString();
            const unclaimedFee1 = (Number(unclaimedFee1Wei) / 10 ** 18)
              .toFixed(6)
              .toString();
            setFeeUSDC(unclaimedFee1);
            setFeeETH_WBTC(unclaimedFee0);
            // считает баланс комиссий в долларах
            if (addr == ETHContractAddress) {
              setFeeDollars(
                (Number(unclaimedFee0) * priceUSDC_ETH + Number(unclaimedFee1))
                  .toFixed(6)
                  .toString()
              );
              const pricePreview = priceUSDC_ETH.toFixed(2);
              setPriceView(pricePreview);
            }
            //  ниже раскоментировать когда появится второй пул с Битком
            //   и для него посчитаем прайс priceUSDC_WBTC
            // else {
            //   setBalanceDollars((Number(amount1) * priceUSDC_WBTC) + Number(amount0));
            //   const pricePreview = priceUSDC_WBTC.toFixed(2);
            //   setPriceView(pricePreview);
            // }
  
            // // Calculate amount
            const liquidity = first[8];
            let sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLower)).toFixed(18); // (18)нужно вытаскивать десималс из токена
            let sqrtRatioB = Math.sqrt(1.0001 ** Number(tickUpper)).toFixed(18); // (18)нужно вытаскивать десималс из токена
            let currentRatio = Math.sqrt(1.0001 ** Number(currentTick)).toFixed(18);
            let currentRatioPrice = (1.0001 ** Number(currentTick)).toFixed(18);
            let sqrtRatioBPrice = (1.0001 ** Number(tickUpper)).toFixed(18);
            let sqrtRatioAPrice = (1.0001 ** Number(tickLower)).toFixed(18);
            setRatioAPrice((+sqrtRatioAPrice).toFixed(2).toString());
            setRatioBPrice((+sqrtRatioBPrice).toFixed(2).toString());
            setMiddlePurchase((((+sqrtRatioBPrice) + (+sqrtRatioAPrice)) / 2 ).toFixed(2).toString());

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
            const amount0 = (amount0wei / 10 ** 18).toFixed(6).toString();
            const amount1 = (amount1wei / 10 ** 18).toFixed(2).toString();
            setAmountETH_WBTC(amount0);
            setAmountUSDC(amount1);
            // считает баланс токенов в долларах
            if (addr == ETHContractAddress) {
              setBalanceDollars(
                (Number(amount0) * priceUSDC_ETH + Number(amount1))
                  .toFixed(2)
                  .toString()
              );
              // const pricePreview = priceUSDC_ETH.toFixed(2);
              // setPriceView(pricePreview);
            }
            //  ниже раскоментировать когда появится второй пул с Битком
            //   и для него посчитаем прайс priceUSDC_WBTC
            // else {
            //   setBalanceDollars((Number(amount1) * priceUSDC_WBTC) + Number(amount0));
            //   const pricePreview = priceUSDC_WBTC.toFixed(2);
            //   setPriceView(pricePreview);
            // }

           // расчет средней цены // "0" = buy ; "1" = sell
           // для расчета в формуле - нужен прайс который устанавливает пользователь
           // сохранять на серваке ???
        //    if (buySellString == "0") {
        //     const halfPrice =
        //       (priceUSDC_ETH - Number(targetPrice)) / 2 + Number(targetPrice);
        //     setHalfPrice(halfPrice);
        //     } else {
        //     // sell
        //     const halfPrice =
        //       (Number(targetPrice) - priceUSDC_ETH) / 2 + priceUSDC_ETH;
        //     setHalfPrice(halfPrice);
        //    }

          }
        }
      })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleOpenModalTx = async () => {
      setIsOpenModalTx(false);
     };

     const handleOpenAlertError = async () => {
      setIsOpenAlertError(false);
     };

    return (
      <div className="flex flex-col h-full flex flex-col items-center font-['GothamPro']">
        <div className="flex flex-col items-center max-[529px]:w-[99%] w-11/12 min-[1222px]:w-[1211px] relative h-fit min-[1222px]:h-[788px] rounded-[22px] bg-[#0A0914] z-[2] mt-[188px] mb-[123px]">
          <div className="absolute flex justify-between items-center top-[-58px] left-[0]">
            <div className="flex">
              <Image src={iconETH_WBTC} alt="" width={29} height={29} />
              <p className="color-[#FFF] text-[32px] max-[395px]:text-[28px] font-normal tracking-[-0.64px] mx-[11px]">
                {ETH_WBTC}
              </p>
            </div>
            <Chip
              variant="plain"
              size="lg"
              sx={{
                color: colorRange,
                background: "transparent",
                fontFamily: "GothamPro",
              }}
              startDecorator={
                <Avatar src={colorDot} sx={{ width: "8px", height: "8px" }} />
              }
            >
              {inRange}
            </Chip>
            <div className="flex justify-center items-center w-[168px] h-[31px] rounded-[1000px] bg-[#FFFFFF2B]">
              <p className="text-[12px] tracking-[0.12px]">
                Current price: $ {priceView}
              </p>
            </div>
          </div>
          <div className="flex max-[1221px]:flex-col justify-between items-center w-fit min-[1222px]:w-[1120px] h-auto min-[1222px]:h-[425px] mt-[50px]">
            <div className="flex flex-col items-center justify-center w-11/12 min-[489px]:w-[489px] h-[368px] bg-[#5706FF]">
              <TradingViewWidget />
            </div>
            <div className="flex flex-col max-[1221px]:mt-[15px] item-center justify-between">
              <div className="flex flex-col items-center w-[370px] min-[635px]:w-[568px] h-[206px] rounded-[13px] bg-[#141320]">
                <div className="flex justify-between items-start w-[350px] min-[635px]:w-[520px] mt-[18px]">
                  <div className="flex flex-col items-start">
                    <div className="text-[#8A8997] text-[14px] tracking-[0.14px]">
                      Order balance
                    </div>
                    <div className="text-[32px] tracking-[-1.28px] leading-[48.7px]">
                      $ {balanceDollars}
                    </div>
                  </div>
                  <Button
                    sx={{
                      color: "#FFF",
                      backgroundColor: "#5706FF",
                      width: "156px",
                      height: "50px",
                      borderRadius: "1000px",
                      boxShadow: "0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
                      fontSize: "12px",
                      fontStyle: "normal",
                      fontWeight: "700",
                      lineHeight: "152.2%",
                      letterSpacing: "0.24px",
                    }}
                    onClick={closePositionId}
                  >
                    CLOSE ORDER
                  </Button>
                </div>
                <div className="flex justify-between items-center w-[347px] min-[635px]:w-[517px] mt-[23.5px]">
                  <div className="flex items-center">
                    <Image src={USDC} alt="" width={30} height={30} />
                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                      USDC
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[16px] tracking-[0.16px] opacity-50 mr-[33px]">
                      {amountUSDC}
                    </p>
                    <p className="text-[16px] tracking-[0.16px] opacity-50">
                      {share1}
                      {""}%
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center w-[347px] min-[635px]:w-[517px] mt-[7.6px]">
                  <div className="flex items-center">
                    <Image src={iconETH_WBTC} alt="" width={30} height={30} />
                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                      {ETH_WBTC}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-[16px] tracking-[0.16px] opacity-50 mr-[33px]">
                      {amountETH_WBTC}
                    </p>
                    <p className="text-[16px] tracking-[0.16px] opacity-50">
                      {share0}
                      {""}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center  w-[370px] min-[635px]:w-[568px] h-[206px] rounded-[13px] bg-[#141320] mt-[13px]">
                <div className="flex justify-between items-start w-[350px] min-[635px]:w-[520px] mt-[18px]">
                  <div className="flex flex-col items-start">
                    <div className="text-[#8A8997] text-[14px] tracking-[0.14px]">
                      Fee balance
                    </div>
                    <div className="text-[32px] tracking-[-1.28px] leading-[48.7px]">
                      $ {feeDollars}
                    </div>
                  </div>
                  <Button
                    sx={{
                      color: "#FFF",
                      backgroundColor: "#5706FF",
                      width: "156px",
                      height: "50px",
                      borderRadius: "1000px",
                      boxShadow: "0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
                      fontSize: "12px",
                      fontStyle: "normal",
                      fontWeight: "700",
                      lineHeight: "152.2%",
                      letterSpacing: "0.24px",
                    }}
                    onClick={claimFees}
                  >
                    CLAIM FEES
                  </Button>
                </div>
                <div className="flex justify-between items-center w-[347px] min-[635px]:w-[517px] mt-[23.5px]">
                  <div className="flex items-center">
                    <Image src={USDC} alt="" width={30} height={30} />
                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                      USDC
                    </p>
                  </div>
                  <p className="text-[16px] tracking-[0.16px] opacity-50">
                    $ {feeUSDC}
                  </p>
                </div>
                <div className="flex justify-between items-center  w-[347px] min-[635px]:w-[517px] mt-[7.6px]">
                  <div className="flex items-center">
                    <Image src={iconETH_WBTC} alt="" width={30} height={30} />
                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                      {ETH_WBTC}
                    </p>
                  </div>
                  <p className="text-[16px] tracking-[0.16px] opacity-50">
                    {feeETH_WBTC}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative flex max-[1221px]:flex-col  max-[1221px]:items-center justify-between mt-[134px] w-fit min-[1222px]:w-[1120px] h-auto min-[1222px]:h-[139px]">
            <div className="absolute top-[-56px] left-0">
              <p className="text-[32px] font-bold tracking-[-0.64px]">
                Analytics
              </p>
            </div>
            <div className="relative flex flex-col items-start w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
              <p className="mb-[4px] mt-[25px] ml-[30px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                Middle purchase
              </p>
              <p className="mb-[3px] ml-[30px] text-[24px] tracking-[-0.48px] leading-[36.528px]">
                $ {middlePurchase}
              </p>
              <div className="flex ml-[30px] items-center">
                <div>
                  <Image src={USDC} alt="" width={30} height={30} />
                </div>
                <div className="absolute left-[45px] bottom-[19px]">
                  <Image src={MATIC} alt="" width={30} height={30} />
                </div>
                <p className="opacity-50 ml-[23.5px] text-[14px] tracking-[0.14px]">
                MATIC for USDC
                </p>
              </div>
            </div>
            <div className="relative flex flex-col items-start max-[1221px]:my-[15px] w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
              <p className="mb-[4px] mt-[25px] ml-[30px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                Current income
              </p>
              <div className="flex items-center mb-[3px] ml-[30px] ">
                <p className="text-[#6FEE8E]">+</p>
                <p className="text-[24px] tracking-[-0.48px] leading-[36.528px]">
                  $ {feeDollars}
                </p>
              </div>
              <div className="flex ml-[30px] items-center">
                <div>
                  <Image src={USDC} alt="" width={30} height={30} />
                </div>
                <div className="absolute left-[45px] bottom-[19px]">
                  <Image src={MATIC} alt="" width={30} height={30} />
                </div>
                <p className="opacity-50 ml-[23.5px] text-[14px] tracking-[0.14px]">
                MATIC for USDC
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start max-[1221px]:mb-[10px] w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
              <p className="mb-[8px] mt-[27px] ml-[32px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                Your range
              </p>
              <div className="flex ml-[32px]">
                <div className="flex flex-col items-start">
                  <p className="text-[24px] tracking-[-0.48px] leading-[36.528px] mb-[8px]">
                    $ {ratioAPrice}
                  </p>
                  <p className="opacity-50 text-[14px] tracking-[0.14px]">
                    Min price
                  </p>
                </div>
                <p className="text-[24px] font-bold leading-[36.582px] mx-[21px] opacity-30">
                  -
                </p>
                <div className="flex flex-col items-start">
                  <p className="text-[24px] tracking-[-0.48px] leading-[36.528px] mb-[8px]">
                    $ {ratioBPrice}
                  </p>
                  <p className="opacity-50 text-[14px] tracking-[0.14px]">
                    Max Price
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div aria-disabled={true} role="alert">
          <ModalTsxInprogress
            onOpenModalTx={handleOpenModalTx}
            isOpenModalTx={isOpenModalTx}
            miniTxhash={miniTxhash}
            hashLinkPlus={hashLinkPlus}
          />
        </div>
        <div aria-disabled={true} role="alert">
          <AlertError
            onOpenAlertError={handleOpenAlertError}
            isOpenAlertError={isOpenAlertError}
          />
        </div>
      </div>
    );
}

export default ProtectedRoute(OrderIdPage);
