"use client"
import { Card, CardBody, CardHeader} from "@nextui-org/card"
import { Button } from "@nextui-org/button"
import { Divider } from "@nextui-org/divider"
import Image from "next/image";
import { Chip } from "@nextui-org/chip"
import ETH from "@/public/eth.svg"
import WBTC from "@/public/btc.svg"
import USDC from "@/public/usdc.svg"
import Chart from "@/components/chart";
import React, {useEffect, useState} from "react"
import { ethers } from "ethers";
import { Contract } from "ethers";
import { maxUint128 } from "viem";
import defaultProvider from "../../defaultProvider";
import abiContract from "../../abiContract";
const { abi: INonfungiblePositionManagerABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json');

  export default function orderPage({ params }: { params: { id: string } }) {
  
      const [nameOrder, setNameOrder] = useState<string>("");
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
      const addressContract = "0x5ce832046e25fBAc5De4519f4d3b8052EDA5Fa86";
      const nonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
      const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";
      const toketETH = "0xE26D5DBB28bB4A7107aeCD84d5976A06f21d8Da9";
      const tokenUSDC = "0x9EC3c43006145f5701d4FD527e826131778cA122";
  
  
     useEffect(() => {
       (async () => {
          const balance: bigint = await defaultProvider.getBalance(
            "0xF687212015A7DD203741CAe1b7f5aB5A846a4023"
          );

          const contractView = new Contract(
            addressContract,
            abiContract,
            defaultProvider
          );
  
          const contractNonfungiblePositionManager: any = new Contract(
              nonfungiblePositionManager,
              INonfungiblePositionManagerABI,
              defaultProvider
          )
  
          const allPositions = await contractView.getOpenPositions("0xF687212015A7DD203741CAe1b7f5aB5A846a4023");
          const contractProvider = new ethers.Contract(addressContract, abiContract, defaultProvider); // это можно взять из глобала
          const sqrtPriceX96EthUsdt = await contractProvider.getCurrentSqrtPriceX96(
            toketETH,
            tokenUSDC,
            "3000"
          );
          const priceUSDC_ETH = 1 / (Number(sqrtPriceX96EthUsdt) ** 2 / 2 ** 192);
          // ещё нужен прайс для битка тут
          
          var nums: any = allPositions;
  
          for (let i = 0; i < allPositions.length; i++) {
            var first: any = nums[i]; 
            const struct0 = first[0];
            const tokenIdPosition = struct0[2].toString();
            const buySellString = struct0[0].toString();
            const addr = first[4].toString();
//установка заголовка ордера
            if(tokenIdPosition == params.id) {
              if(buySellString == "0" && addr == toketETH) {
                setNameOrder("BUY ETH / USDC");       // заполнение ордера
                setETH_WBTC("ETH ");
                setIconETH_WBTC(ETH);
               } else if(buySellString == "1" && addr == toketETH) {
                setNameOrder("SELL ETH / USDC");      // заполнение ордера
                setETH_WBTC("ETH ");
                setIconETH_WBTC(ETH);
               } else if(buySellString == "0" && addr != toketETH) {
                setNameOrder("BUY WBTC / USDC");   
                setETH_WBTC("WBTC ");
                setIconETH_WBTC(WBTC);
              }  else if(buySellString == "1" && addr != toketETH) {
                setNameOrder("SELL WBTC / USDC");   
                setETH_WBTC("WBTC ");
                setIconETH_WBTC(WBTC);
             }
//установка в рэнже или нет
             let currentTick = await contractView.getCurrentTick(poolAddressETH_USDC);
             const tickLower = first[6];
             const tickUpper = first[7];
             if(currentTick > tickLower && currentTick < tickUpper) {
              setInRange("IN RANGE");
              setColorRange("bg-[#45D483]");
             } else {
              setInRange("OUT OF RANGE"); //
              setColorRange("bg-[#e73326]");
             }
                     
  // // Calculate fee
            const {
              amount0: unclaimedFee0Wei,
              amount1: unclaimedFee1Wei,
            } = await contractNonfungiblePositionManager.collect.staticCall({
              tokenId: tokenIdPosition,
              recipient: addressContract,
              amount0Max: maxUint128,
              amount1Max: maxUint128,
            });
            const unclaimedFee0 = (Number(unclaimedFee0Wei) / (10**18)).toFixed(2).toString();
            const unclaimedFee1 = (Number(unclaimedFee1Wei) / (10**18)).toFixed(6).toString();
            setFeeUSDC(unclaimedFee0);
            setFeeETH_WBTC(unclaimedFee1);
     // считает баланс комиссий в долларах
            if(addr == toketETH) {
              setFeeDollars(((Number(unclaimedFee1) * priceUSDC_ETH) + Number(unclaimedFee0)).toFixed(2).toString());
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
            setAmountUSDC(amount0);
            setAmountETH_WBTC(amount1);
      // считает баланс токенов в долларах
            if(addr == toketETH) {
            setBalanceDollars(((Number(amount1) * priceUSDC_ETH) + Number(amount0)).toFixed(2).toString());
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
           }
         }
        })();
      }, []);

    return (
        <div className="flex flex-col h-full lg:h-screen flex flex-col items-center">
             
                <Card className="xl:w-[886px] w-5/6 border-1-solid-#3D59AD rounded-[15px] bg-[#7980A580] mt-[110px] max-[1023px]:mb-[30px] flex flex-col items-center">
                    <div className="xl:w-[773px] w-11/12">
                    <CardHeader className="flex max-[680px]:flex-col justify-between content-center max-[680px]:items-start">
                        <div className="flex max-[680px]:flex-col justify-between">
                            <div className="flex justify-between content-center gap-[21px] text-white font-medium text-[20px] font-inter">
                                <Image src={iconETH_WBTC} alt="" width={31} height={31} />
                                <p>{nameOrder}</p>
                            </div>
                            <div className="min-[681px]:ml-[48px]">
                                <Chip radius="sm" classNames={{
                                    base: colorRange,
                                    content: "text-white font-medium text-[20px] font-inter",
                                    }}
                                >
                                    {inRange}
                                </Chip>
                            </div>
                        </div>
                        <div className="flex justify-end text-[#F1F1F166] font-medium text-[16px] font-inter">
                            <p>{ETH_WBTC} current price: $ {priceView}</p>
                        </div>
                    </CardHeader>
                    <Divider className="bg-white"/>
                    <CardBody className="grid grid-cols-1 lg:grid-cols-2 gap-[18px]">
                        <div className="flex flex-col justify-center content-center ">    
                            <Chart />
                        </div>
                        <div className="flex flex-col item-center justify-center gap-[22px]">
                            <div className="flex flex-col">
                                <div className="h-[25px] w-[138px] text-center text-[#F1F1F166] font-medium text-[14px] font-inter">
                                    Order balance
                                </div>
                                <div className="flex max-[347px]:flex-col max-[347px]:items-center justify-around w-full xl:w-[370px] h-[145px] bg-[#F1F3FF] rounded-[15px]">
                                    <div className="flex flex-col content-center justify-center">
                                        <div className="text-black text-center font-medium text-[32px] font-inter">
                                            $ {balanceDollars}
                                        </div>
                                        <div className="flex flex-col content-center font-inter text-[16px] text-[#4C5270] font-semibold">
                                            <div className="flex flex-row justify-start gap-[40px]">
                                                <Image src={USDC} alt="" width={18} height={18}/>
                                                <p>{amountUSDC}</p>
                                            </div>
                                            <div className="flex flex-row justify-start gap-[40px]">
                                                <Image src={iconETH_WBTC} alt="" width={18} height={18}/>
                                                <p>{amountETH_WBTC}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <Button className="bg-[#6078F9] w-[120px] min-[419px]:w-[172px] rounded-[6px] text-[#FFFFFF] font-semibold text-[16px] font-inter">
                                            Close order
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="h-[25px] w-[138px] text-center text-[#F1F1F166] font-medium text-[14px] font-inter">
                                    Fee balance
                                </div>
                                <div className="flex max-[347px]:flex-col max-[347px]:items-center justify-around w-full xl:w-[370px] h-[145px] bg-[#F1F3FF] rounded-[15px]">
                                    <div className="flex flex-col content-center justify-center">
                                        <div className="text-black text-center font-medium text-[32px] font-inter">
                                            $ {feeDollars}
                                        </div>
                                        <div className="flex flex-col content-center font-inter text-[16px] text-[#4C5270] font-semibold">
                                            <div className="flex flex-row justify-start gap-[40px]">
                                                <Image src={USDC} alt="" width={18} height={18}/>
                                                <p>{feeUSDC}</p>
                                            </div>
                                            <div className="flex flex-row justify-start gap-[40px]">
                                                <Image src={iconETH_WBTC} alt="" width={18} height={18}/>
                                                <p>{feeETH_WBTC}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <Button className="bg-[#6078F9] w-[120px] min-[419px]:w-[172px] rounded-[6px] text-[#FFFFFF] font-semibold text-[16px] font-inter">
                                            Claim fees
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </CardBody>
                    </div>
                </Card>  
        </div>
    )
}

