import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Avatar,
  ListItemDecorator,
  ListDivider,
  Select,
  Option,
  Input,
  Button,
  ButtonGroup,
  IconButton,
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  ModalClose,
  DialogTitle,
  DialogContent,
} from "@mui/joy";
import { SelectOption } from "@mui/joy/Select";
import {
  KeyboardArrowDown,
  AddCircleOutline as Plus,
  RemoveCircleOutline as Minus,
} from "@mui/icons-material";
import { useWalletStore } from "@/service/store";
import defaultProvider from "../app/provider/defaultProvider";
import abiContract from "../components/abiContract";
import "@/app/font.css"
import ModalTsxInprogress from "./ModalTsxInpogress";
import AlertError from "./AlertError";
import MediaQuery from "react-responsive";

type Options = {
  value: string;
  label: string;
  src: string;
};

const options: Options[] = [
  { value: "eth", label: "ETH", src: "/eth.svg" },
  { value: "matic", label: "MATIC", src: "/matic.svg" },
];

const TEXT_BUY_CARD = {
  btn: "Create Order",
};

const BuyCard = () => {
  const {
    isConnect,
    account,
    positionManagerContractAddress,
    usdtSigner,
    contractSigner,
    USDTContractAddress,
    ETHContractAddress,
    reinitializeContracts,
  } = useWalletStore();

  const [count, setCount] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [selectedOption, setSelectedOption] = useState<Options>(options[0]);

  const [open, setOpen] = React.useState<boolean>(false);
  const [currentRatioPrice, setCurrentRatioPrice] = useState("");
  const [middlePurchase, setMiddlePurchase] = useState("");
  const [futureAmount, setFutureAmount] = useState("");

  const [isOpenAlertError, setIsOpenAlertError] = React.useState<boolean>(false);
  const [isOpenModalTx, setIsOpenModalTx] = React.useState<boolean>(false);
  const [txhash, setTxhash] = useState("");
  const miniTxhash = txhash.substring(0, 5) + "....." + txhash.slice(45);
  const hashLink = process.env.NEXT_PUBLIC_HASH_LINK_MUMBAI;
  const hashLinkPlus = hashLink + txhash;

  const contractProvider = new ethers.Contract(
    positionManagerContractAddress,
    abiContract,
    defaultProvider
  );
  // вытаскиваем данные для расчетов курсов и тд
  useEffect(() => {
    reinitializeContracts();
    (async () => {
      try {
        let pool = await contractProvider.getPoolAddress(
          USDTContractAddress,
          ETHContractAddress,
          3000 // TODO: make changable
        );
        let currentTick = await contractProvider.getCurrentTick(
          pool
        );
        let currentRatioPrice = (1.0001 ** Number(currentTick)).toFixed(18);
        setCurrentRatioPrice((+currentRatioPrice).toFixed(2).toString());
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const getOpenBuyPosition = async () => {
    setOpen(false);
    try {
      const allowance = await usdtSigner.allowance(
        account,
        positionManagerContractAddress
      );

      const allowanceToString = ethers.formatUnits(allowance, 0);
      const allowanceToNumber = +allowanceToString / 10 ** 18;
      const amountCoinBigint = ethers.parseUnits(count.toString(), 18);
      const amountCoin_ = ethers.formatUnits(amountCoinBigint, 0);
      let targetPriceReady = BigInt(Math.sqrt(Number(targetPrice)) * 2 ** 96);
      let targetReady_ = targetPriceReady.toString();

      const maxUint256 = ethers.MaxInt256;

      allowanceToNumber < +count
        ? await usdtSigner.approve(positionManagerContractAddress, maxUint256)
        : null;

      const tx = await contractSigner.openBuyPosition(
        ETHContractAddress,
        USDTContractAddress,
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
      window.location.replace("/orders");
    } catch (error) {
      setIsOpenModalTx(false);
      setIsOpenAlertError(true);
      console.error(error);
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amountInputValue = Number(event.target.value);

    if (!amountInputValue) {
      setCount("");
      return;
    }

    if (isNaN(amountInputValue)) {
      return;
    }

    setCount(String(amountInputValue));
  };

  const handleTargetPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetPriceInputValue = Number(event.target.value);

    if (!targetPriceInputValue) {
      setTargetPrice('');
      setMiddlePurchase('');
      setFutureAmount('');
      return;
    }

    if (isNaN(targetPriceInputValue)) {
      return;
    }

    const targetPrice = String(targetPriceInputValue);
    setTargetPrice(targetPrice);

    if (targetPriceInputValue < Number(currentRatioPrice)) {

      const middlePurchase = ((Number(currentRatioPrice) + targetPriceInputValue) / 2).toFixed(2);
      const futureAmount = (Number(count) / Number(middlePurchase)).toFixed(4);

      setMiddlePurchase(middlePurchase);
      setFutureAmount(futureAmount);
    } else {
      setMiddlePurchase('');
      setFutureAmount('');
    }
  };

  const isButtonDisabled = !isConnect || !targetPrice || !count || Number(targetPrice) > Number(currentRatioPrice) || Number(count) >= 50;

  const handleOpenModalTx = async () => {
    setIsOpenModalTx(false);
  };

  const handleOpenAlertError = async () => {
    setIsOpenAlertError(false);
  };

  function renderValue(option: SelectOption<string> | null) {
    return option ? (
      <>
        <ListItemDecorator>
          <Avatar
            size="sm"
            src={options.find((o) => o.value === option.value)?.src}
          />
        </ListItemDecorator>
        <span className="ml-2">{option.label}</span>
      </>
    ) : null;
  }

  return (
    <div className="flex relative flex-col items-center bg-[#0A0914] max-[539px]:pb-[30px] w-[98%] min-[540px]:w-[540px] h-fit min-[540px]:h-[621px] rounded-[32px] font-['GothamPro']">
      <Select
        indicator={<KeyboardArrowDown />}
        defaultValue={selectedOption ? selectedOption.value : 'eth'}
        onChange={(_, value) => {
          const selectedOption = options.find(option => option.value === value);
          if (selectedOption) {
            setSelectedOption(selectedOption);
          }
        }}
        slotProps={{
          listbox: {
            sx: {
              borderRadius: "12px",
            },
          },
        }}
        sx={{
          height: "50px",
          borderRadius: "100px",
          marginTop: "38px",
          backgroundColor: "#0A0914",
          fontFamily: "GothamPro"
        }}
        renderValue={renderValue}
        className="w-11/12 min-[540px]:w-[476px]"
      >
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index !== 0 ? (
              <ListDivider role="none" inset="startContent" />
            ) : null}
            <Option
              value={option.value}
              label={option.label}
              sx={{ borderRadius: "100px", fontFamily: "GothamPro", marginLeft: '2%' }}
              className="w-[96%] min-[540px]:w-456px"
            >
              <ListItemDecorator>
                <Avatar size="sm" src={option.src} />
              </ListItemDecorator>
              {option.label}
            </Option>
          </React.Fragment>
        ))}
      </Select>

      <MediaQuery minWidth={540}>
        <div className="flex w-[464px] h-[160px] justify-start mt-[50px]">
          <div style={{
            borderTop: '1px solid #6FEE8E',
            borderBottom: '1px solid #433F72',
            backgroundPosition: 'center',
            backgroundSize: '100%'
          }}
            className="w-[242px] mr-[22px] h-[157px] bg-[url('/vectorUp.svg')]"
          >
          </div>
          <div className="absolute flex flex-col items-start justify-between top-[133px] right-[24px] w-[205px] h-[159px]">
            <div>
              <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                Current price
              </div>
              <div className="text-[16px] font-normal leading-[24.32px]">
                $ {currentRatioPrice}
              </div>
            </div>
            <div>
              <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                Middle purchase
              </div>
              <div className="text-[16px] font-normal leading-[24.32px]">
                $ {middlePurchase}
              </div>
            </div>
            <div>
              <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                You will get
              </div>
              <div className="text-[16px] font-normal leading-[24.32px]">
                ~ {futureAmount} ETH
              </div>
            </div>
          </div>
        </div>
      </MediaQuery>
      <Input
        className="w-11/12 min-[540px]:w-[476px] max-[539px]:my-[30px] min-[540px]:mt-[59px]"
        placeholder="Amount"
        variant="outlined"
        value={count || ''}
        endDecorator={
          <React.Fragment>
            <Select
              sx={{
                fontFamily: "GothamPro",
                width: "135px",
                [`&:hover`]: {
                  borderRadius: "1000px",
                },
              }}
              indicator={<KeyboardArrowDown />}
              defaultValue="usdc"
              variant="plain"
              slotProps={{
                listbox: {
                  variant: "outlined",
                  sx: {
                    borderRadius: "12px",
                    fontFamily: "GothamPro",
                  },
                },
              }}
              startDecorator={
                <React.Fragment>
                  <Avatar size="sm" src="/usdc.svg" />
                </React.Fragment>
              }
            >
              <Option
                value="usdc"
                sx={{
                  borderRadius: "100px",
                  width: "125px",
                  marginLeft: "4.5px",
                  fontFamily: "GothamPro",
                }}
              >
                <Avatar size="sm" src="/usdc.svg" />
                USDC
              </Option>
            </Select>
          </React.Fragment>
        }
        sx={{
          height: "50px",
          borderRadius: "100px",
          backgroundColor: "#0A0914",
          fontFamily: "GothamPro"
        }}
        onChange={handleAmountChange}
      />
      <FormControl sx={{ marginTop: "21px" }}>
        <FormLabel
          sx={{
            color: "#8A8997",
            fontSize: "12px",
            fontWeight: "normal",
            letterSpacing: "0.12px",
            fontFamily: "GothamPro"
          }}
        >
          Target Price
        </FormLabel>
        <Input
          className="w-[100%] min-[540px]:w-[476px] max-[539px]:mb-[10px]"
          variant="outlined"
          endDecorator={
            <ButtonGroup
              spacing="9px"
              sx={{ borderRadius: "100%" }}
              variant="plain"
            >
              <IconButton
                disabled={!targetPrice || Number(targetPrice) >= Number(currentRatioPrice)}
                onClick={() => {
                  if (targetPrice !== null && Number(targetPrice) < Number(currentRatioPrice)) {
                    setTargetPrice(String(Number(targetPrice) + 1));
                  }
                }}
                variant="plain"
              >
                <Plus />
              </IconButton>
              <IconButton
                disabled={Number(targetPrice) <= 1}
                onClick={() => {
                  if (targetPrice !== null && Number(targetPrice) > 1) {
                    setTargetPrice(String(Number(targetPrice) - 1));
                  }
                }}
                variant="plain"
              >
                <Minus />
              </IconButton>
            </ButtonGroup>
          }
          value={targetPrice || ''}
          onChange={handleTargetPrice}
          sx={{
            height: "50px",
            borderRadius: "100px",
            backgroundColor: "#0A0914",
            fontFamily: "GothamPro"
          }}
        />
      </FormControl>
      <React.Fragment>
        <Button
          disabled={isButtonDisabled}
          sx={{
            color: "#FFF",
            textAlign: "center",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: "700",
            lineHeight: "18.264px",
            letterSpacing: "0.24px",
            textTransform: "uppercase",
            width: "210px",
            height: "55px",
            backgroundColor: "#5706FF",
            borderRadius: "1000px",
            boxShadow: "0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
            marginTop: "28px",
            fontFamily: "GothamPro"
          }}
          onClick={() => setOpen(true)}
        >
          {TEXT_BUY_CARD.btn}
        </Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog
            variant="plain"
            sx={(theme) => ({
              width: '500px',
              position: "relative",
              borderRadius: "12px",
              fontFamily: "GothamPro",
              [theme.breakpoints.only('xs')]: {
                width: '80%',
              }
            })}
          >
            <ModalClose
              sx={{
                position: "absolute",
                top: "5px",
                right: "0",
                opacity: "0.5",
              }}
            />
            <DialogTitle sx={{ fontFamily: "GothamPro" }}>Confirmation</DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "GothamPro"
              }}
            >
              <div className="relative flex items-center w-11/12 min-[540px]:w-[455px] justify-between mt-[40px]">
                <div className="absolute left-0 top-[-23px]">
                  <p className="text-[14px]">From</p>
                </div>
                <div className="flex items-center">
                  <Avatar size="sm" src="/usdc.svg" />
                  <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                    USDC
                  </p>
                </div>
                <p className="text-[25px] text-[#FFF] tracking-[-0.64px]">
                  {count}
                </p>
              </div>
              <div className="relative flex items-center w-11/12 min-[540px]:w-[455px] justify-between mt-[30px]">
                <div className="absolute left-0 top-[-23px]">
                  <p className="text-[14px]">To</p>
                </div>
                <div className="flex items-center">
                  <Avatar size="sm" src={selectedOption.src} /> 
                  <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                    {selectedOption.label}
                  </p>
                </div>
                <p className="text-[25px] text-[#FFF] tracking-[-0.64px]">
                  {futureAmount}
                </p>
              </div>
              <div className="flex flex-col items-center w-11/12 min-[540px]:w-[455px] rounded-[12px] bg-[#141320] mt-[30px]">
                <div className="flex items-center justify-between w-10/12 min-[540px]:w-[415px] my-[10px]">
                  <p className="text-[16px]">Middle price</p>
                  <p className="text-[16px] text-[#FFF]">$ {middlePurchase}</p>
                </div>
              </div>
              <Button
                sx={{
                  color: "#FFF",
                  textAlign: "center",
                  fontSize: "12px",
                  fontStyle: "normal",
                  fontWeight: "700",
                  lineHeight: "18.264px",
                  letterSpacing: "0.24px",
                  textTransform: "uppercase",
                  width: "210px",
                  height: "55px",
                  backgroundColor: "#5706FF",
                  borderRadius: "1000px",
                  boxShadow: "0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
                  marginTop: "28px",
                  fontFamily: "GothamPro"
                }}
                onClick={getOpenBuyPosition}
              >
                Confirm
              </Button>
            </DialogContent>
          </ModalDialog>
        </Modal>
      </React.Fragment>
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
};

export default BuyCard;
