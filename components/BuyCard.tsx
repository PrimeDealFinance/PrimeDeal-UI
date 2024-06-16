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
import "@/app/font.css";
import { parse } from "path";
import ModalTsxInprogress from "./ModalTsxInpogress";

const options = [
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

  /// @dev if amount larger 5, disable buttons
  const [amountDisable, setAmountDisable] = useState(true);
  const [count, setCount] = useState("");
  const [targetPrice, setTargetPrice] = useState(0);
  const [open, setOpen] = React.useState<boolean>(false);
  const [currentRatioPrice, setCurrentRatioPrice] = useState("");
  const [middlePurchase, setMiddlePurchase] = useState("");
  const [futureAmount, setFutureAmount] = useState("");
  const [isOpenModalTx, setIsOpenModalTx] = React.useState<boolean>(false);
  const [txhash, setTxhash] = useState("");
  const miniTxhash = txhash.substring(0, 5) + "....." + txhash.slice(45);
  const hashLink = process.env.NEXT_PUBLIC_HASH_LINK_MUMBAI;
  const hashLinkPlus = hashLink + txhash;
  const poolAddressETH_USDC = "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B";

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
        let currentTick = await contractProvider.getCurrentTick(
          poolAddressETH_USDC
        );
        let currentRatioPrice = (1.0001 ** Number(currentTick)).toFixed(18);
        setCurrentRatioPrice((1 / +currentRatioPrice).toFixed(2).toString());
      } catch (error) {
        console.error(error);
      }
    })();
  }, [
    positionManagerContractAddress,
    reinitializeContracts,
    contractProvider,
    poolAddressETH_USDC,
  ]);

  const getOpenBuyPosition = async () => {
    try {
      const allowance = await usdtSigner.allowance(
        account,
        positionManagerContractAddress
      );

      const allowanceToString = ethers.formatUnits(allowance, 0);
      const allowanceToNumber = +allowanceToString / 10 ** 18;
      const amountCoinBigint = ethers.parseUnits(count.toString(), 18);
      const amountCoin_ = ethers.formatUnits(amountCoinBigint, 0);
      let targetPriceReady = BigInt(Math.sqrt(1 / +targetPrice) * 2 ** 96);
      let targetReady_ = targetPriceReady.toString();

      const maxUint256 = ethers.MaxInt256;

      allowanceToNumber < +count
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

  /// @dev Disable buttons if amount out of range
  const handleChangeAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    Number(event.target.value) > 50 || event.target.value === ""
      ? setAmountDisable(true)
      : setAmountDisable(false);
  };

  const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    Number(event.target.value) > 50 || event.target.value === ""
      ? setAmountDisable(true)
      : setAmountDisable(false);

    const parseValue = parseInt(String(event.target.value).replace("/D/g", ""));

    if (isNaN(parseValue)) {
      setFutureAmount("");
    } else {
      setCount(parseValue.toFixed(2));
    }

    setCount(String(event.target.value).replace("/D/g", ""));
  };

  const handleTargetPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parseValue = Number(event.target.value);
    let middlePurchase = ((+currentRatioPrice + parseValue) / 2)
      .toFixed(2)
      .toString();

    if (isNaN(Number(middlePurchase))) {
      setMiddlePurchase("");
    } else {
      setMiddlePurchase(middlePurchase);
    }

    setFutureAmount((+count / +middlePurchase).toFixed(2).toString());

    if (!isNaN(parseValue)) {
      setTargetPrice(parseValue);
    }
  };

  const handleOpenModalTx = async () => {
    setIsOpenModalTx(false);
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
    <div className="flex relative flex-col items-center bg-[#0A0914] w-[540px] h-[621px] rounded-[32px] font-['GothamPro']">
      <Select
        indicator={<KeyboardArrowDown />}
        defaultValue="eth"
        slotProps={{
          listbox: {
            sx: {
              borderRadius: "12px",
            },
          },
        }}
        sx={{
          width: "476px",
          height: "50px",
          borderRadius: "100px",
          marginTop: "38px",
          backgroundColor: "#0A0914",
          fontFamily: "GothamPro",
        }}
        renderValue={renderValue}
      >
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index !== 0 ? (
              <ListDivider role="none" inset="startContent" />
            ) : null}
            <Option
              value={option.value}
              label={option.label}
              sx={{
                borderRadius: "100px",
                width: "456px",
                marginLeft: "10px",
                fontFamily: "GothamPro",
              }}
            >
              <ListItemDecorator>
                <Avatar size="sm" src={option.src} />
              </ListItemDecorator>
              {option.label}
            </Option>
          </React.Fragment>
        ))}
      </Select>
      <div className="flex w-[464px] h-[160px] justify-start mt-[50px]">
        <div
          style={{
            borderTop: "1px solid #6FEE8E",
            borderBottom: "1px solid #433F72",
            backgroundPosition: "center",
            backgroundSize: "100%",
          }}
          className="w-[242px] mr-[22px] h-[157px] bg-[url('/vectorUp.svg')]"
        ></div>
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
      <Input
        placeholder="Amount"
        variant="outlined"
        value={count}
        endDecorator={
          <React.Fragment>
            <Select
              sx={{
                fontFamily: "GothamPro",
                width: "130px",
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
                  width: "120px",
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
          width: "476px",
          height: "50px",
          borderRadius: "100px",
          marginTop: "59px",
          backgroundColor: "#0A0914",
          fontFamily: "GothamPro",
        }}
        onChange={handleCountChange}
      />
      <FormControl sx={{ marginTop: "21px" }}>
        <FormLabel
          sx={{
            color: "#8A8997",
            fontSize: "12px",
            fontWeight: "normal",
            letterSpacing: "0.12px",
            fontFamily: "GothamPro",
          }}
        >
          Target Price
        </FormLabel>
        <Input
          id="Amount"
          placeholder=""
          variant="outlined"
          endDecorator={
            <ButtonGroup
              spacing="9px"
              sx={{ borderRadius: "100%" }}
              variant="plain"
            >
              <IconButton
                disabled={amountDisable}
                onClick={() => setTargetPrice(targetPrice + 1)}
                variant="plain"
              >
                <Plus />
              </IconButton>
              <IconButton
                disabled={amountDisable}
                onClick={() => setTargetPrice(targetPrice - 1)}
                variant="plain"
              >
                <Minus />
              </IconButton>
            </ButtonGroup>
          }
          value={targetPrice}
          onChange={handleTargetPrice}
          sx={{
            width: "476px",
            height: "50px",
            borderRadius: "100px",
            backgroundColor: "#0A0914",
            fontFamily: "GothamPro",
          }}
        />
      </FormControl>
      <React.Fragment>
        <Button
          id={"buy-button"}
          disabled={!isConnect || amountDisable}
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
            fontFamily: "GothamPro",
          }}
          onClick={() => setOpen(true)}
        >
          {TEXT_BUY_CARD.btn}
        </Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog
            variant="plain"
            sx={{
              width: "500px",
              position: "relative",
              borderRadius: "12px",
              fontFamily: "GothamPro",
            }}
          >
            <ModalClose
              sx={{
                position: "absolute",
                top: "-40px",
                right: "0",
                opacity: "0.3",
              }}
            />
            <DialogTitle sx={{ fontFamily: "GothamPro" }}>
              Confirmation
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "GothamPro",
              }}
            >
              <div className="relative flex items-center w-[455px] justify-between mt-[40px]">
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
              <div className="relative flex items-center w-[455px] justify-between mt-[30px]">
                <div className="absolute left-0 top-[-23px]">
                  <p className="text-[14px]">To</p>
                </div>
                <div className="flex items-center">
                  <Avatar size="sm" src="/eth.svg" />
                  <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                    ETH
                  </p>
                </div>
                <p className="text-[25px] text-[#FFF] tracking-[-0.64px]">
                  {futureAmount}
                </p>
              </div>
              <div className="flex flex-col items-center w-[455px] rounded-[12px] bg-[#141320] mt-[30px]">
                <div className="flex items-center justify-between w-[415px] mt-[10px]">
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
                  fontFamily: "GothamPro",
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
    </div>
  );
};

export default BuyCard;
