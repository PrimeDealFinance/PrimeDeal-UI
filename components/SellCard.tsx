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
  Radio,
  RadioGroup,
  radioClasses,
  Sheet
} from "@mui/joy";
import { SelectOption } from "@mui/joy/Select";
import {
  KeyboardArrowDown,
  AddCircleOutline as Plus,
  RemoveCircleOutline as Minus,
  CheckCircleRounded as CheckCircleRoundedIcon
} from "@mui/icons-material";
import { useWalletStore } from "@/service/store";
import "@/app/font.css";
import defaultProvider from "../app/provider/defaultProvider";
import abiContract from "../components/abiContract";
import './index.css'
import MediaQuery from "react-responsive";

const options = [
  { value: "eth", label: "ETH", src: "/eth.svg" },
  { value: "matic", label: "MATIC", src: "/matic.svg" },
];

const fees = ['0.01%', '0.05%', '0.30%', '1%']

const TEXT_CELL_CARD = {
  btn: "Create Order",
};

const ETH_MAX_COST = 100000;

const SellCard = () => {
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

  const [count, setCount] = useState<number | null>(null);
  const [amountDisable, setAmountDisable] = useState(true);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);

  const [open, setOpen] = React.useState<boolean>(false);
  const [currentRatioPrice, setCurrentRatioPrice] = useState('');
  const [middlePurchase, setMiddlePurchase] = useState('');
  const [futureAmount, setFutureAmount] = useState("");
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
  }, []);

  const getOpenSellPosition = async () => {
    try {
      if (targetPrice && count) {
        const allowance = await usdtSigner.allowance(
          account,
          positionManagerContractAddress
        );

        const allowanceToString = ethers.formatUnits(allowance, 0);
        const allowanceToNumber = +allowanceToString / 10 ** 18;
        const amountCoinBigint = ethers.parseUnits(count.toString(), 18);
        const amountCoin_ = ethers.formatUnits(amountCoinBigint, 0);
        let targetPriceReady = BigInt(Math.sqrt(1 / targetPrice) * 2 ** 96);
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

        // setTxhash(tx.hash);
        // setIsOpenModalTx(true);
        const response = await tx.wait();
        // setIsOpenModalTx(false);
        console.log("responseTxSwap1: ", response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isValidAmount = (value: number): boolean => {
    return !isNaN(value) && value >= 0 && value <= 1 && value.toString().length <= 6;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue: number = parseFloat(event.target.value);

    const isValid = isValidAmount(inputValue);
    setAmountDisable(!isValid);
    setCount(isValid ? Number(inputValue.toFixed(4)) : null);
  };

  const handleTargetPrice = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parseValue = Number(event.target.value);

    if (!isNaN(parseValue) && parseValue >= 1 && parseValue <= ETH_MAX_COST)  {
      let middlePurchase = ((+currentRatioPrice + parseValue) / 2)
        .toFixed(2)
        .toString();
      setMiddlePurchase(middlePurchase);

      if (count !== null) {
        setFutureAmount((count * +middlePurchase).toFixed(2).toString());
      }

      setTargetPrice(parseValue);
    } else {
      setMiddlePurchase('');
      setFutureAmount('');
      setTargetPrice(null);
    }
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
    <div className="flex relative flex-col items-center bg-[#0A0914] max-[539px]:pb-[30px] w-[98%] min-[540px]:w-[540px] h-fit min-[540px]:h-[711px] rounded-[32px] font-['GothamPro']">
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
          height: "50px",
          borderRadius: "100px",
          marginTop: "38px",
          backgroundColor: "#0A0914",
          fontFamily: 'GothamPro'
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
          <div
            style={{
              borderTop: "1px solid #433F72",
              borderBottom: "1px solid #6FEE8E",
              backgroundPosition: "center",
              backgroundSize: "100%",
            }}
            className="w-[242px] mr-[22px] h-[157px] bg-[url('/vectorDown.svg')]"
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
                ~ $ {futureAmount}
              </div>
            </div>
          </div>
        </div>
      </MediaQuery>
      <Input
        className="input_amount w-11/12 min-[540px]:w-[476px] max-[539px]:my-[30px] min-[540px]:mt-[59px]"
        type="number"
        placeholder="Amount"
        variant="outlined"
        value={count ?? ''}
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
              renderValue={renderValue}
              indicator={<KeyboardArrowDown />}
              defaultValue="eth"
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
                      width: "125px",
                      marginLeft: "4.5px",
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
          </React.Fragment>
        }
        sx={{
          height: "50px",
          borderRadius: "100px",
          backgroundColor: "#0A0914",
          fontFamily: "GothamPro",
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
            fontFamily: "GothamPro",
          }}
        >
          Target Price
        </FormLabel>
        <Input
          className="input_amount w-[100%] min-[540px]:w-[476px] max-[539px]:mb-[10px]"
          type="number"
          placeholder=""
          variant="outlined"
          endDecorator={
            <ButtonGroup
            spacing="9px"
            sx={{ borderRadius: "100%" }}
            variant="plain"
          >
            <IconButton
              disabled={targetPrice === null || targetPrice >= ETH_MAX_COST}
              onClick={() => {
                if (targetPrice !== null && targetPrice < ETH_MAX_COST) {
                  setTargetPrice(targetPrice + 1);
                }
              }}
              variant="plain"
            >
              <Plus />
            </IconButton>
            <IconButton
              disabled={targetPrice === null || targetPrice <= 1}
              onClick={() => {
                if (targetPrice !== null && targetPrice > 1) {
                  setTargetPrice(targetPrice - 1);
                }
              }}
              variant="plain"
            >
              <Minus />
            </IconButton>
          </ButtonGroup>
          }
          sx={{
            height: "50px",
            borderRadius: "100px",
            backgroundColor: "#0A0914",
            fontFamily: "GothamPro",
          }}
          value={targetPrice ?? ''}
          onChange={handleTargetPrice}
        />
      </FormControl>
      <FormControl sx={{marginTop: '21px'}}>
      <FormLabel
          sx={{
            color: "#8A8997",
            fontSize: "12px",
            fontWeight: "normal",
            letterSpacing: "0.12px",
            fontFamily: "GothamPro"
          }}
        >
          Pool Fees
        </FormLabel>
        <RadioGroup 
           aria-label="fees"
           defaultValue="0.05%"
           overlay
           name="fees"
           sx={{
             fontFamily: 'GothamPro',
             flexDirection: 'row',
             gap: 2,
             [`& .${radioClasses.checked}`]: {
               [`& .${radioClasses.action}`]: {
                 inset: -1,
                 border: '3px solid',
                 borderColor: '#5706FF',
               },
             },
             [`& .${radioClasses.radio}`]: {
               display: 'contents',
               '& > svg': {
                 zIndex: 2,
                 position: 'absolute',
                 top: '-8px',
                 right: '-8px',
                 bgcolor: 'background.surface',
                 borderRadius: '12px',
               },
             },
           }}
           className="w-11/12"
        >
          {fees.map((value) => (
            <Sheet
              key={value}
              variant="outlined"
              sx={ (theme) =>({
                borderRadius: '12px',
                boxShadow: 'sm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                p: 0.5,
                minWidth: 100,
                [theme.breakpoints.only('xs')]: {
                  minWidth: 70,
                }
              })}
            >
              <Radio id={value} value={value} checkedIcon={<CheckCircleRoundedIcon />} />
              <FormLabel htmlFor={value} sx={{fontFamily:'GothamPro'}}>{value}</FormLabel>
            </Sheet>
          ))}
        </RadioGroup>
      </FormControl>
      <React.Fragment>
        <Button
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
          {TEXT_CELL_CARD.btn}
        </Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog
            variant="plain"
            sx={ (theme) => ({
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
            <DialogTitle sx={{ fontFamily: "GothamPro" }}>
              Confirmation
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div className="relative flex items-center w-11/12 min-[540px]:w-[455px] justify-between mt-[40px]">
                <div className="absolute left-0 top-[-23px]">
                  <p className="text-[14px]">From</p>
                </div>
                <div className="flex items-center">
                  <Avatar size="sm" src="/eth.svg" />
                  <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                    ETH
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
                  <Avatar size="sm" src="/usdc.svg" />
                  <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                    USDC
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
                }}
                onClick={getOpenSellPosition}
              >
                Confirm
              </Button>
            </DialogContent>
          </ModalDialog>
        </Modal>
      </React.Fragment>
    </div>
  );
};

export default SellCard;
