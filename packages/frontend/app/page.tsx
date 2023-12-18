"use client"
import { ethers } from "ethers";
import React, { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import  Header  from "@/components/header";
//import { Button }  from "@nextui-org/button";
//import { Input } from "@nextui-org/input";
import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { Select, SelectItem} from "@nextui-org/select";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { createExternalExtensionProvider } from '@metamask/providers';
import ModalWindow from "./ModalWindowConnect";
import StartPage from "./StartPage";
import CommonModalWindow from "./CommonModalWindow";
const { abi: IUniswapV3PoolABI }  = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
import ERC20abi from "./ERC20"; 


declare global {
  interface Window{
    ethereum?:MetaMaskInpageProvider
  }
}
interface Accounts {
  [key: number]: any
}
 

export default function Home() {
  
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [isOpenCommonModal, setIsOpenCommonModal] = useState<boolean>(false);
  const [contentCommonModal, setContentCommonModal] = useState<string>("Error");
  const [someBool, setSomeBool] = useState(false);
  //const [someBool, setSomeBool] = useState<boolean>(false);
  const [isConnect, setIsConnect] = useState<boolean>(false);
  const [provider, setProvider] = useState<any>("");
  const [account, setAccount] = useState<string>("");
  const [singer, setSinger] = useState("");
  //const [price, setPrice] = useState(30000);
  const [coin, setCoin] = useState<string>("");
  const [deal, setDeal] = useState<string>("");
  const [isCoin, setIsCoin] = useState<boolean>(false);
  const [isDeal, setIsDeal] = useState<boolean>(false);
  const [isOpenModalConnect, setIsOpenModalConnect] = useState<boolean>(false);
  const [enterAmount, setEnterAmount] = useState<string>("Enter amount of");
  const [price, setPrice] = useState<string>("Set target price");
  const [amountCoin, setAmountCoin] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");

  const addressETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // arb ETH
  const ERC20_ETH = new ethers.Contract(addressETH, ERC20abi, provider);

  const addressWBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"; // arb WBTC
  const ERC20_WBTC = new ethers.Contract(addressWBTC, ERC20abi, provider);

  const addressUSDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"; // arb USDC.e
  const ERC20_USDC = new ethers.Contract(addressUSDC, ERC20abi, provider);

  const poolAddress = "0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443"; // pool ETH/USDC.e
  const [uniswapV3PoolETH_USDC, setUniswapV3PoolETH_USDC] = useState<any>("");
  const [priceUSDC_ETH, setPriceUSDC_ETH] = useState<number>(0);

  const poolAddressUSDT_BTC = "0x53C6ca2597711Ca7a73b6921fAf4031EeDf71339"; // pool BTC/USDT
  const [uniswapV3PoolUSDT_BTC, setUniswapV3PoolUSDT_BTC] = useState<any>("");
  const [priceUSDT_BTC, setPriceUSDT_BTC] = useState<number>(0);
  
  const handleIsConnected = async () => {
    if (window.ethereum == null) {
        console.log("MetaMask not installed; using read-only defaults")
        //const provider = createExternalExtensionProvider();
        //const provider = ethers.getDefaultProvider()
    
    } else {
        //const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const accounts: Accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) ?? 0;
        //const accounts1: {[index: number]:any}
        const provider: any = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        if(Number(network.chainId) !== 42161) {
          console.log("Wrong network. Need Arb")
          setIsOpenCommonModal(true);
          setContentCommonModal("Wrong network. Please connect to Arbitrum!");
        } else {
          setAccount(accounts[0]);
          setProvider(provider);
          setSinger(signer);
          setIsConnect(true);
          setIsOpenModalConnect(false);

          setUniswapV3PoolETH_USDC(
            new ethers.Contract(
              poolAddress,
             IUniswapV3PoolABI,
             provider
           ))
           setUniswapV3PoolUSDT_BTC(
            new ethers.Contract(
             poolAddressUSDT_BTC,
             IUniswapV3PoolABI,
             provider
           ))
        }
    }

  }
  
  const startAddLiquid = async () => {
    setIsOpenModalConnect(true);
  }
  const handleOpenModal = async () => {
    onOpenChange();
  }
  const handleOpenCommonChange = async () => {
    setIsOpenCommonModal(false);
  }
  

  // set the prise
   useEffect(() => {
    (async () => {
      if(isCoin && isDeal) {
    const slot0UE = await uniswapV3PoolETH_USDC.slot0();
   // setTickUSDT_ETH(slot0UE[1].toString());
    const sqrtPriceX96UE = slot0UE[0].toString();
   // setSqrtPriceX96USDT_ETH(sqrtPriceX96UE);

    //let mathPrice = Number(sqrtPriceX96USDT_ETH) ** 2 / 2 ** 192;
    //const decimalAdjustment = 10 ** (tokenWETHDecimals - tokenUSDTDecimals);
    const decimalAdjustment = 10 ** (18 - 6);
    const priceUSDT_ETH = (Number(sqrtPriceX96UE) ** 2 / 2 ** 192) * decimalAdjustment;
    setPriceUSDC_ETH(priceUSDT_ETH);

    //
    const slot0UB = await uniswapV3PoolUSDT_BTC.slot0();
    // setTickUSDT_ETH(slot0UE[1].toString());
     const sqrtPriceX96UB = slot0UB[0].toString();
    // setSqrtPriceX96USDT_ETH(sqrtPriceX96UE);
 
     //let mathPrice = Number(sqrtPriceX96USDT_ETH) ** 2 / 2 ** 192;
     //const decimalAdjustment = 10 ** (tokenWETHDecimals - tokenUSDTDecimals);
     const decimalAdjustmentUB = 10 ** (8 - 6);
     const priceUSDT_BTC = (Number(sqrtPriceX96UB) ** 2 / 2 ** 192) * decimalAdjustmentUB;
     setPriceUSDT_BTC(priceUSDT_BTC);
      }
  })();
}, [isCoin, isDeal]);

  //  user Choose Coin

  function handleCoinChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if(!isConnect) {
      console.log("Please, connect to Metamask");
      setIsOpenModalConnect(true);
      setCoin("");
      setDeal("");

    } else {
    setCoin(e.target.value);
    setIsCoin(true);
    if(e.target.value == "WBTC"){
    setEnterAmount("Enter amount WBTC");
    } else {
      setEnterAmount("Enter amount ETH");
    }
  }
}

//  user Choose Deal
function handleDealChange(e: React.ChangeEvent<HTMLSelectElement>) {
  if(!isConnect) {
    console.log("Please, connect to Metamask");
    setIsOpenModalConnect(true);
    setCoin("");
    setDeal("");
  } else {
  setDeal(e.target.value);
  setIsDeal(true);
  if(e.target.value == "SELL" && coin == "WBTC"){
    setEnterAmount("Enter amount WBTC");
    setPrice("Target selling price");
    } else if(e.target.value == "SELL" && coin == "ETH") {
      setEnterAmount("Enter amount ETH");
      setPrice("Target selling price");
    } else if(e.target.value == "BUY" && coin == "WBTC"){
      setEnterAmount("Enter amount USDC");
      setPrice("Target purchase price");
    } else if(e.target.value == "BUY" && coin == "ETH"){
      setEnterAmount("Enter amount USDC");
      setPrice("Target purchase price");
    }
  }
}

  // check errors
  
  const previewOrder = async () => {
        const balanceInWeiUSDC = await ERC20_USDC.balanceOf(account);
        const balanceUSDC: string = ethers.formatEther(balanceInWeiUSDC);
        const balanceUSDCview: number = Number(balanceUSDC) * 10**12;
        console.log("balanceUSDCview: ", balanceUSDCview);

        const balanceInWeiETH = await provider.getBalance(account);
        const balanceETH: string = ethers.formatEther(balanceInWeiETH);
        const balanceETHview: number = Number(balanceETH);
        console.log("ETHbalance: ", balanceETHview);

        const balanceInWeiWBTC = await ERC20_WBTC.balanceOf(account);
        const balanceWBTC: string = ethers.formatEther(balanceInWeiWBTC);
        const balanceWBTCview: number = Number(balanceWBTC) * 10**10;
        console.log("balanceWBTCview: ", balanceWBTCview);

        if(deal == "BUY" && Number(amountCoin) > balanceUSDCview) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect amount! You don't have enough USDC");
          setAmountCoin("");
        } else if(coin == "ETH" && deal == "SELL" && Number(amountCoin) > balanceETHview) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect amount! You don't have enough ETH");
          setAmountCoin("");
        } else if(coin == "WBTC" && deal == "SELL" && Number(amountCoin) > balanceWBTCview) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect amount! You don't have enough WBTC");
          setAmountCoin("");
        } else {
        if(coin == "WBTC" && deal == "BUY" && (Number(targetPrice) > priceUSDT_BTC)) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect target price. NEED LOWER than current price!");
          setTargetPrice("");
        } else if(coin == "WBTC" && deal == "SELL" && Number(targetPrice) < priceUSDT_BTC) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect target price. NEED UPPER than current price!");
          setTargetPrice("");
        } else if(coin == "ETH" && deal == "BUY" && Number(targetPrice) > priceUSDC_ETH) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect target price. NEED LOWER than current price!");
          setTargetPrice("");
        } else if(coin == "ETH" && deal == "SELL" && Number(targetPrice) < priceUSDC_ETH) {
          setIsOpenCommonModal(true);
          setContentCommonModal("Incorrect target price. NEED UPPER than current price!");
          setTargetPrice("");
        } 
        else {
          onOpenChange();
          countAverage();
        }
       }
    }


  // input amount
  const setAmount = (e:ChangeEvent<HTMLInputElement>) => {
    setAmountCoin(e.target.value);
  }
  // input price
  const setTarget = (e:ChangeEvent<HTMLInputElement>) => {
    setTargetPrice(e.target.value);
  }

  const [halfPrice, setHalfPrice] = useState<number>(0);
  const [predictBuySell, setPredictBuySell] = useState<number>(0);
  const [feeProfit, setFeeProfit] = useState<number>(0);
  //count average buy/sell
  const countAverage = () => {
    const annualPercent = 50;
    // buy
    if(deal == "BUY") {
    const halfPrice = ((priceUSDC_ETH - Number(targetPrice)) / 2) + Number(targetPrice);
    setHalfPrice(halfPrice);
    const predictBuySell = Number(amountCoin) / halfPrice;
    setPredictBuySell(predictBuySell);
    const feeProfit = Number(amountCoin) / 100 * annualPercent / 365;
    setFeeProfit(feeProfit);
    } else {
      // sell
      const halfPrice = ((Number(targetPrice) - priceUSDC_ETH) / 2) + priceUSDC_ETH;
      setHalfPrice(halfPrice);
      const predictBuySell = halfPrice * Number(amountCoin);
      setPredictBuySell(predictBuySell);
      const feeProfit = predictBuySell / 100 * annualPercent / 365;
      setFeeProfit(feeProfit);
    }
  }
  

  return (
    <>
    <Header
      onClickConnect={handleIsConnected}
      isConnect={isConnect}
      account={account}
    />
    <>
    {!isConnect ? 
     <div className="flex flex-col h-screen flex flex-col items-center mt-[129px]"> 
        <StartPage 
          onClickConnect={handleIsConnected}
           />
    </div>
     :
     <>
    <div className="flex flex-col h-screen flex flex-col items-center"> 
      <div className=" flex flex-col items-center bg-white rounded-[15px] w-[464px] h-[283px] mt-[129px]">
        <div className="flex flex-wrap md:flex-nowrap gap-[43px] mt-[63px]">
        
          <Select onChange={handleCoinChange}
          variant="bordered" placeholder="Select an asset" className="w-[187px] h-[44px]" radius="lg" size="sm">
              <SelectItem key="ETH" value="ETH">
                  ETH
              </SelectItem>
              <SelectItem key="WBTC" value="WBTC">
                  WBTC
              </SelectItem>
          </Select>
          <Select onChange={handleDealChange}
          variant="bordered" placeholder="Select option" className="w-[187px]" radius="lg" size="sm">
              <SelectItem key="BUY" value="BUY">
                BUY
              </SelectItem>
              <SelectItem key="SELL" value="SELL">
                SELL
              </SelectItem>
          </Select>
        </div>
        {isConnect && isCoin && isDeal ? 
       <>
        <div className="flex flex-wrap md:flex-nowrap gap-[41px] mt-[15px]">
            <Input onChange={setAmount}
                   value={amountCoin}
                   type="number" 
                   label={enterAmount}  
                   variant="bordered" className="w-[187px]" radius="lg" size="sm" />
            <Input onChange={setTarget}
                   value={targetPrice}
                   type="number" 
                   label={price} 
                   variant="bordered" className="w-[187px]" radius="lg" size="sm" />  
        </div>
        {coin == "ETH" ?
            <div className="mt-[5px]">
            Current ETH price, $: {priceUSDC_ETH.toFixed(2)}
            </div>
            :
            <div className="mt-[5px]">
            Current WBTC price, $: {priceUSDT_BTC.toFixed(2)}
            </div>
        }
        
        <Button onClick={previewOrder} 
        className="bg-[#F9607CF0] text-white w-[185px] h-[36px] rounded-[15px] mt-[18px] font-semibold font-inter text-[16px]">
          Preview Order</Button>
        <>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="flex flex-col items-center">
          {(onClose) => (
            <>
              <ModalHeader className="text-[#F9607C]">Your Position</ModalHeader>
              <ModalBody className="flex flex-row">
               <div className="text-right">
                  {deal == "BUY" ? 
                  <p> You’II get, {coin}: {predictBuySell.toFixed(6)} </p>
                   :
                   <p> You’II get, USDC: {predictBuySell.toFixed(6)} </p>
                  }
                <p> Average price of purchase, $: {halfPrice.toFixed(2)} </p>
                <p> Your reward in a day, $: {feeProfit.toFixed(2)} </p>
                <p> Your reward in a week, $: {(feeProfit * 7).toFixed(2)}</p>
                <p> Your reward in a month, $: {(feeProfit * 30).toFixed(2)} </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose}>
                  Change order
                </Button>
                              <Button color="primary" onPress={startAddLiquid}>
                                Confirm order
                              </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
        </>
        </>
       :
       <div className="text-center mt-[25px]">
                <p> Please choose the asset </p>
                <p> you want to use </p>
                <p> and</p>
                <p> option you want to deal</p>
                <p> </p>
                </div>
        }
      </div> 
    </div>   
    </>

}
    </> 
      <ModalWindow
        isConnect={isConnect}
        isOpenModalConnect={isOpenModalConnect}
        onOpenChange={handleOpenModal}
        onClickConnect={handleIsConnected}
      /> 
      <CommonModalWindow
        isOpenCommonModal={isOpenCommonModal}
        onOpenCommonChange={handleOpenCommonChange}
        contentCommonModal={contentCommonModal}
      /> 
    </> 
  );
}