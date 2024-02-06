"use client";
import { ethers } from "ethers";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button, Input } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { MetaMaskInpageProvider } from "@metamask/providers";
import ModalWindow from "./ModalWindowConnect";
import StartPage from "./StartPage";
import CommonModalWindow from "./CommonModalWindow";
import ModalWindowTx from "./ModalWindowTx";
import ERC20abi from "./ERC20";
import { useWalletStore } from "@/service/store";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}
interface Accounts {
  [key: number]: any;
}

export default function Home() {
  const {
    handleIsConnected,
    isConnect,
    account,
    handleConnectNotice,
    provider,
    contractSigner,
    usdtSigner,
    ethSigner,
    isOpenModalConnect,
    setIsOpenModalConnect,
    setIsOpenCommonModal,
    isOpenCommonModal,
    contentCommonModal,
    setContentCommonModal,
    positionManagerContractAddress,
    USDTContractAddress,
    ETHContractAddress,
  } = useWalletStore();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isOpenModalTx, setIsOpenModalTx] = useState<boolean>(false);
  const [coin, setCoin] = useState<string>("");
  const [deal, setDeal] = useState<string>("");
  const [isCoin, setIsCoin] = useState<boolean>(false);
  const [isDeal, setIsDeal] = useState<boolean>(false);
  const [enterAmount, setEnterAmount] = useState<string>("Enter amount of");
  const [price, setPrice] = useState<string>("Set target price");
  const [amountCoin, setAmountCoin] = useState<string>("");
  const [targetPrice, setTargetPrice] = useState<string>("");
  const [txhash, setTxhash] = useState("");

  const miniTxhash = txhash.substring(0, 5) + "....." + txhash.slice(45);
  const hashLink = process.env.NEXT_PUBLIC_HASH_LINK_MUMBAI;
  const hashLinkPlus = hashLink + txhash;

  const ERC20_ETH = new ethers.Contract(ETHContractAddress, ERC20abi, provider);
  const ERC20_USDC = new ethers.Contract(
    USDTContractAddress,
    ERC20abi,
    provider
  );

  const [priceUSDC_ETH, setPriceUSDC_ETH] = useState<number>(0);
  const [priceUSDT_BTC, setPriceUSDT_BTC] = useState<number>(0);

  const getOpenBuyPosition = async () => {
    onOpenChange();

    try {
      const allowance = await usdtSigner.allowance(
        account,
        positionManagerContractAddress
      );

      const allowanceToString = ethers.formatUnits(allowance, 0);
      const allowanceToNumber = +allowanceToString / 10 ** 18;
      const amountCoinBigint = ethers.parseUnits(amountCoin, 18);
      const amountCoin_ = ethers.formatUnits(amountCoinBigint, 0);
      let targetPriceReady = BigInt(Math.sqrt(1 / +targetPrice) * 2 ** 96);
      let targetReady_ = targetPriceReady.toString();

      // const amountCoinToNumber = +amountCoin_;

      const maxUint256 = ethers.MaxInt256;

      allowanceToNumber < +amountCoin
        ? await usdtSigner.approve(positionManagerContractAddress, maxUint256)
        : null;

      const tx = await contractSigner.openBuyPosition(
        USDTContractAddress,
        ETHContractAddress,
        "3000",
        targetReady_,
        amountCoin_,
        "0",
        {
          gasLimit: 850000,
        }
      );

      setTxhash(tx.hash);
      setIsOpenModalTx(true);
      const response = await tx.wait();
      setIsOpenModalTx(false);
      console.log("responseTxSwap1: ", response);
    } catch (error) {
      console.error(error);
    }
  };

  const getOpenSellPosition = async () => {
    onOpenChange();
    console.log("here")
    try {
      const allowance = await ethSigner.allowance(
        account,
        positionManagerContractAddress
      );

     const allowanceToString = ethers.formatUnits(allowance, 0);
     const allowanceToNumber = +allowanceToString / 10 ** 18;
      const amountCoinBigint = ethers.parseUnits(amountCoin, 18);
      const amountCoin_ = ethers.formatUnits(amountCoinBigint, 0);
      let targetPriceReady = BigInt(Math.sqrt(1 / +targetPrice) * 2 ** 96);
      let targetReady_ = targetPriceReady.toString();

               // const amountCoinToNumber = +amountCoin_;

     const maxUint256 = ethers.MaxInt256;

      allowanceToNumber < +amountCoin
        ? await ethSigner.approve(positionManagerContractAddress, maxUint256)
        : null;
      console.log("here2")
      const tx = await contractSigner.openSellPosition(
        USDTContractAddress,
        ETHContractAddress,
        "3000",
        targetReady_,
        amountCoin_,
        "0",
        {
          gasLimit: 850000,
        }
      );

      console.log({ USDTContractAddress });
      console.log({ ETHContractAddress });
      console.log({ targetReady_ });
      console.log({ amountCoin_ });

      setTxhash(tx.hash);
      setIsOpenModalTx(true);
      const response = await tx.wait();
      setIsOpenModalTx(false);
      console.log("responseTxSwap1: ", response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = async () => {
    onOpenChange();
  };
  const handleOpenCommonChange = async () => {
    setIsOpenCommonModal(false);
  };
  const handleOpenModalTx = async () => {
    setIsOpenModalTx(false);
  };
  // const handleConnectNotice = async () => {
  //  setIsOpenCommonModal(true);
  //   setContentCommonModal("Please connect to Metamask!");
  //  };

  // set the price
  useEffect(() => {
    (async () => {
      if (isCoin && isDeal) {
        const sqrtPriceX96EthUsdt = await contractSigner.getCurrentSqrtPriceX96(
          ETHContractAddress,
          USDTContractAddress,
          "3000"
        );
        // console.log("sqrtPriceX96EthUsdt", sqrtPriceX96EthUsdt);
        const priceUSDT_ETH = Number(sqrtPriceX96EthUsdt) ** 2 / 2 ** 192;
        // console.log("priceUSDT_ETH: ", 1 / priceUSDT_ETH);
        setPriceUSDC_ETH(1 / priceUSDT_ETH);

        // const slot0UE = await uniswapV3PoolETH_USDC.slot0();
        // console.log("slot0UE: ", slot0UE);
        // setTickUSDT_ETH(slot0UE[1].toString());
        // const sqrtPriceX96UE = slot0UE[0].toString();
        // console.log("sqrtPriceX96UE: ", sqrtPriceX96UE);
        // setSqrtPriceX96USDT_ETH(sqrtPriceX96UE);

        //let mathPrice = Number(sqrtPriceX96USDT_ETH) ** 2 / 2 ** 192;
        //const decimalAdjustment = 10 ** (tokenWETHDecimals - tokenUSDTDecimals);
        //const decimalAdjustment = 10 ** (18 - 6);

        //
        // const slot0UB = await uniswapV3PoolUSDT_BTC.slot0();
        //  const sqrtPriceX96UB = slot0UB[0].toString();
        //  const decimalAdjustmentUB = 10 ** (8 - 6);
        //  const priceUSDT_BTC = (Number(sqrtPriceX96UB) ** 2 / 2 ** 192) * decimalAdjustmentUB;
        // setPriceUSDT_BTC(priceUSDT_BTC);
      }
    })();
  }, [isCoin, isDeal]); // eslint-disable-line react-hooks/exhaustive-deps

  //  user Choose Coin

  function handleCoinChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isConnect) {
      console.log("Please, connect to Metamask");
      setIsOpenModalConnect(true);
      setCoin("");
      setDeal("");
    } else {
      setCoin(e.target.value);
      setIsCoin(true);
      if (e.target.value == "WBTC") {
        setEnterAmount("Enter amount WBTC");
      } else {
        setEnterAmount("Enter amount ETH");
      }
    }
  }

  //  user Choose Deal
  function handleDealChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!isConnect) {
      console.log("Please, connect to Metamask");
      setIsOpenModalConnect(true);
      setCoin("");
      setDeal("");
    } else {
      setDeal(e.target.value);
      setIsDeal(true);
      if (e.target.value == "SELL" && coin == "WBTC") {
        setEnterAmount("Enter amount WBTC");
        setPrice("Target selling price");
      } else if (e.target.value == "SELL" && coin == "ETH") {
        setEnterAmount("Enter amount ETH");
        setPrice("Target selling price");
      } else if (e.target.value == "BUY" && coin == "WBTC") {
        setEnterAmount("Enter amount USDC");
        setPrice("Target purchase price");
      } else if (e.target.value == "BUY" && coin == "ETH") {
        setEnterAmount("Enter amount USDC");
        setPrice("Target purchase price");
      }
    }
  }

  // check errors

  const previewOrder = async () => {
    const balanceInWeiUSDC = await ERC20_USDC.balanceOf(account);
    const balanceUSDC: string = ethers.formatEther(balanceInWeiUSDC);
    const balanceUSDCview: number = Number(balanceUSDC) * 10 ** 12;
    console.log("balanceUSDCview: ", balanceUSDCview);

    //const balanceInWeiETH = await provider.getBalance(account);
    const balanceInWeiETH = await ERC20_ETH.balanceOf(account);
    const balanceETH: string = ethers.formatEther(balanceInWeiETH);
    const balanceETHview: number = Number(balanceETH);
    console.log("ETHbalance: ", balanceETHview);

    // разкомментировать когда установим реальный пул для битка
    // const balanceInWeiWBTC = await ERC20_WBTC.balanceOf(account);
    // const balanceWBTC: string = ethers.formatEther(balanceInWeiWBTC);
    // const balanceWBTCview: number = Number(balanceWBTC) * 10**10;
    // console.log("balanceWBTCview: ", balanceWBTCview);

    if (deal == "BUY" && Number(amountCoin) > balanceUSDCview) {
      setIsOpenCommonModal(true);
      setContentCommonModal("Incorrect amount! You don't have enough USDC");
      setAmountCoin("");
    } else if (
      coin == "ETH" &&
      deal == "SELL" &&
      Number(amountCoin) > balanceETHview
    ) {
      setIsOpenCommonModal(true);
      setContentCommonModal("Incorrect amount! You don't have enough ETH");
      setAmountCoin("");
    }

    // разкомментировать когда установим реальный пул для битка
    // else if(coin == "WBTC" && deal == "SELL" && Number(amountCoin) > balanceWBTCview) {
    //   setIsOpenCommonModal(true);
    //   setContentCommonModal("Incorrect amount! You don't have enough WBTC");
    //   setAmountCoin("");
    // }
    else {
      if (
        coin == "WBTC" &&
        deal == "BUY" &&
        Number(targetPrice) > priceUSDT_BTC
      ) {
        setIsOpenCommonModal(true);
        setContentCommonModal(
          "Incorrect target price. NEED LOWER than current price!"
        );
        setTargetPrice("");
      } else if (
        coin == "WBTC" &&
        deal == "SELL" &&
        Number(targetPrice) < priceUSDT_BTC
      ) {
        setIsOpenCommonModal(true);
        setContentCommonModal(
          "Incorrect target price. NEED UPPER than current price!"
        );
        setTargetPrice("");
      } else if (
        coin == "ETH" &&
        deal == "BUY" &&
        Number(targetPrice) > priceUSDC_ETH
      ) {
        setIsOpenCommonModal(true);
        setContentCommonModal(
          "Incorrect target price. NEED LOWER than current price!"
        );
        setTargetPrice("");
      } else if (
        coin == "ETH" &&
        deal == "SELL" &&
        Number(targetPrice) < priceUSDC_ETH
      ) {
        setIsOpenCommonModal(true);
        setContentCommonModal(
          "Incorrect target price. NEED UPPER than current price!"
        );
        setTargetPrice("");
      } else {
        onOpenChange();
        countAverage();
      }
    }
  };

  // input amount
  const setAmount = (e: ChangeEvent<HTMLInputElement>) => {
    setAmountCoin(e.target.value);
  };
  // input price
  const setTarget = (e: ChangeEvent<HTMLInputElement>) => {
    setTargetPrice(e.target.value);
  };

  const [halfPrice, setHalfPrice] = useState<number>(0);
  const [predictBuySell, setPredictBuySell] = useState<number>(0);
  const [feeProfit, setFeeProfit] = useState<number>(0);
  //count average buy/sell
  const countAverage = () => {
    const annualPercent = 50;
    // buy
    if (deal == "BUY") {
      const halfPrice =
        (priceUSDC_ETH - Number(targetPrice)) / 2 + Number(targetPrice);
      setHalfPrice(halfPrice);
      const predictBuySell = Number(amountCoin) / halfPrice;
      setPredictBuySell(predictBuySell);
      const feeProfit = ((Number(amountCoin) / 100) * annualPercent) / 365;
      setFeeProfit(feeProfit);
    } else {
      // sell
      const halfPrice =
        (Number(targetPrice) - priceUSDC_ETH) / 2 + priceUSDC_ETH;
      setHalfPrice(halfPrice);
      const predictBuySell = halfPrice * Number(amountCoin);
      setPredictBuySell(predictBuySell);
      const feeProfit = ((predictBuySell / 100) * annualPercent) / 365;
      setFeeProfit(feeProfit);
    }
  };

  return (
    <>
      <>
        {!isConnect ? (
          <div className="flex flex-col h-screen flex flex-col items-center mt-[129px]">
            <StartPage />
          </div>
        ) : (
          <>
            <div className="flex flex-col h-screen flex flex-col items-center">
              <div className=" flex flex-col items-center bg-white rounded-[15px] max-[466px]:w-11/12 max-[640px]:px-[15px] max-[640px]:pb-[15px] sm:w-[464px] sm:h-[263px] mt-[129px] max-[472px]:mx-[10px]">
                <div className="flex min-[466px]:flex-wrap max-[466px]:grid max-[466px]:grid-cols-1 items-center md:flex-nowrap max-[466px]:gap-[15px] gap-[43px] mt-[63px]">
                  <Select
                    onChange={handleCoinChange}
                    variant="bordered"
                    placeholder="Select an asset"
                    className="w-[187px]"
                    radius="lg"
                    size="sm"
                    aria-label="coin"
                  >
                    <SelectItem key="ETH" value="ETH">
                      ETH
                    </SelectItem>
                    <SelectItem key="WBTC" value="WBTC">
                      WBTC
                    </SelectItem>
                  </Select>
                  <Select
                    onChange={handleDealChange}
                    variant="bordered"
                    placeholder="Select option"
                    className="w-[187px]"
                    radius="lg"
                    size="sm"
                    aria-label="deal"
                  >
                    <SelectItem key="BUY" value="BUY">
                      BUY
                    </SelectItem>
                    <SelectItem key="SELL" value="SELL">
                      SELL
                    </SelectItem>
                  </Select>
                </div>
                {isConnect && isCoin && isDeal ? (
                  <>
                    <div className="flex min-[466px]:flex-wrap max-[466px]:grid max-[466px]:grid-cols-1 md:flex-nowrap max-[466px]:gap-[15px] gap-[41px] mt-[15px]">
                      <Input
                        onChange={setAmount}
                        value={amountCoin}
                        type="number"
                        label={enterAmount}
                        variant="bordered"
                        className="w-[187px]"
                        radius="lg"
                        size="sm"
                      />
                      <Input
                        onChange={setTarget}
                        value={targetPrice}
                        type="number"
                        label={price}
                        variant="bordered"
                        className="w-[187px]"
                        radius="lg"
                        size="sm"
                      />
                    </div>
                    {coin == "ETH" ? (
                      <div className="mt-[5px]">
                        Current ETH price, $: {priceUSDC_ETH.toFixed(2)}
                      </div>
                    ) : (
                      <div className="mt-[5px]">
                        Current WBTC price, $: {priceUSDT_BTC.toFixed(2)}
                      </div>
                    )}

                    <Button
                      onClick={previewOrder}
                      className="bg-[#F9607CF0] text-white w-[185px] h-[36px] rounded-[15px] mt-[18px] font-semibold font-inter text-[16px]"
                    >
                      Preview Order
                    </Button>
                    <>
                      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                        <ModalContent className="flex flex-col items-center">
                          {(onClose) => (
                            <>
                              <ModalHeader className="text-[#F9607C]">
                                Your Position
                              </ModalHeader>
                              <ModalBody className="flex flex-row">
                                <div className="text-right">
                                  {deal == "BUY" ? (
                                    <p>
                                      {" "}
                                      You’II get, {coin}:{" "}
                                      {predictBuySell.toFixed(6)}{" "}
                                    </p>
                                  ) : (
                                    <p>
                                      {" "}
                                      You’II get, USDC:{" "}
                                      {predictBuySell.toFixed(6)}{" "}
                                    </p>
                                  )}
                                  <p>
                                    {" "}
                                    Average price of purchase, $:{" "}
                                    {halfPrice.toFixed(2)}{" "}
                                  </p>
                                  <p>
                                    {" "}
                                    Your reward in a day, $:{" "}
                                    {feeProfit.toFixed(2)}{" "}
                                  </p>
                                  <p>
                                    {" "}
                                    Your reward in a week, $:{" "}
                                    {(feeProfit * 7).toFixed(2)}
                                  </p>
                                  <p>
                                    {" "}
                                    Your reward in a month, $:{" "}
                                    {(feeProfit * 30).toFixed(2)}{" "}
                                  </p>
                                </div>
                              </ModalBody>
                              <ModalFooter>
                                <Button color="danger" onPress={onClose}>
                                  Change order
                                </Button>
                                <Button
                                  color="primary"
                                  onPress={
                                    deal == "BUY"
                                      ? getOpenBuyPosition
                                      : getOpenSellPosition
                                  }
                                >
                                  Confirm order
                                </Button>
                              </ModalFooter>
                            </>
                          )}
                        </ModalContent>
                      </Modal>
                    </>
                  </>
                ) : (
                  <div className="text-center mt-[25px]">
                    <p> Please choose the asset </p>
                    <p> you want to use </p>
                    <p> and</p>
                    <p> option you want to deal</p>
                    <p> </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
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
      <ModalWindowTx
        isOpenModalTx={isOpenModalTx}
        onOpenModalTx={handleOpenModalTx}
        miniTxhash={miniTxhash}
        hashLinkPlus={hashLinkPlus}
      />
    </>
  );
}
