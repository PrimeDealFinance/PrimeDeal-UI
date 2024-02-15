import React, { useState } from "react";
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
    DialogContent
} from '@mui/joy';
import { SelectOption } from '@mui/joy/Select';
import { KeyboardArrowDown, AddCircleOutline as Plus, RemoveCircleOutline as Minus } from '@mui/icons-material';
import { useWalletStore } from "@/service/store";
import "@/app/font.css";

const options = [
    { value: 'eth', label: 'ETH', src: '/eth.svg' },
    { value: 'matic', label: 'MATIC', src: '/matic.svg' },
];

const TEXT_CELL_CARD = {
    btn: 'Create Order'
}

const SellCard = () => {
    const {
        isConnect,
    } = useWalletStore();

    const [count, setCount] = useState(0)

    const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const parseValue = parseInt(event.target.value);
        if (!isNaN(parseValue)) {
            setCount(parseValue)
        }
    }

    const [open, setOpen] = React.useState<boolean>(false);

    function renderValue(option: SelectOption<string> | null) {
        return option ? (
            <>
                <ListItemDecorator>
                    <Avatar size="sm" src={options.find((o) => o.value === option.value)?.src} />
                </ListItemDecorator>
                <span className="ml-2">{option.label}</span>
            </>
        ) : null;
    }

    return (
        <div className="flex relative flex-col items-center bg-[#0A0914] w-[540px] h-[621px] rounded-[32px] font-['GothamPro']">
            <Select
                indicator={<KeyboardArrowDown />}
                defaultValue='usdc'
                slotProps={{
                    listbox: {
                        sx: {
                            borderRadius: '12px',
                            fontFamily: 'GothamPro'
                        },
                    },
                }}
                sx={{
                    width: '476px',
                    height: '50px',
                    borderRadius: '100px',
                    marginTop: '38px',
                    backgroundColor: '#0A0914',
                    fontFamily: 'GothamPro'
                }}
                startDecorator={
                    <React.Fragment>
                        <Avatar size="sm" src="/usdc.svg" />
                    </React.Fragment>
                }
            >
                <Option value="usdc" sx={{ borderRadius: '100px', width: '456px', marginLeft: '10px', fontFamily: 'GothamPro' }}>
                    <Avatar size="sm" src="/usdc.svg" />
                    USDC
                </Option>
            </Select>
            <div className="flex w-[464px] h-[160px] justify-start mt-[50px]">
                <div style={{
                    borderTop: '1px solid #433F72',
                    borderBottom: '1px solid #6FEE8E',
                    backgroundPosition: 'center',
                    backgroundSize: '100%',
                }}
                    className="w-[242px] mr-[22px] h-[157px] bg-[url('/vectorDown.svg')]"
                >
                </div>
                <div className="absolute flex flex-col items-start justify-between top-[133px] right-[24px] w-[205px] h-[159px]">
                    <div>
                        <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                            Текущая цена
                        </div>
                        <div className="text-[16px] font-normal leading-[24.32px]">
                            74280.88
                        </div>
                    </div>
                    <div>
                        <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                            Средняя цена покупки
                        </div>
                        <div className="text-[16px] font-normal leading-[24.32px]">
                            74280.88
                        </div>
                    </div>
                    <div>
                        <div className="text-[#8A8997] text-[12px] font-normal tracking-[0.12px]">
                            Всего получено
                        </div>
                        <div className="text-[16px] font-normal leading-[24.32px]">
                            74280.88
                        </div>
                    </div>
                </div>
            </div>
            <Input
                placeholder="Amount"
                variant="outlined"
                endDecorator={
                    <React.Fragment>
                        <Select
                            sx={{
                                fontFamily: 'GothamPro',
                                width: '130px',
                                [`&:hover`] : {
                                    borderRadius: '1000px',
                                  },
                            }}
                            renderValue={renderValue}
                            indicator={<KeyboardArrowDown />}
                            defaultValue='eth'
                            variant="plain"
                            slotProps={{
                                listbox: {
                                    variant: 'outlined',
                                    sx: {
                                        borderRadius: '12px',
                                        fontFamily: 'GothamPro'
                                    },
                                },
                            }}
                        >
                            {options.map((option, index) => (
                                <React.Fragment key={option.value}>
                                    {index !== 0 ? <ListDivider role="none" inset="startContent" /> : null}
                                    <Option value={option.value} label={option.label} sx={{ borderRadius: '100px', width: '120px', marginLeft: '5px', fontFamily: 'GothamPro' }}>
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
                    width: '476px',
                    height: '50px',
                    borderRadius: '100px',
                    marginTop: '59px',
                    backgroundColor: '#0A0914',
                    fontFamily: 'GothamPro'
                }}
            />
            <FormControl sx={{ marginTop: '21px' }}>
                <FormLabel
                    sx={{
                        color: "#8A8997",
                        fontSize: "12px",
                        fontWeight: "normal",
                        letterSpacing: "0.12px",
                        fontFamily: 'GothamPro'
                    }}
                >
                    Верхняя граница
                </FormLabel>
                <Input
                    placeholder=""
                    variant="outlined"
                    endDecorator={
                        <ButtonGroup spacing='9px' sx={{ borderRadius: '100%' }} variant="plain">
                            <IconButton onClick={() => setCount(count + 1)} variant="plain">
                                <Plus />
                            </IconButton>
                            <IconButton onClick={() => setCount(count - 1)} variant='plain'>
                                <Minus />
                            </IconButton>
                        </ButtonGroup>
                    }
                    sx={{
                        width: '476px',
                        height: '50px',
                        borderRadius: '100px',
                        backgroundColor: '#0A0914',
                        fontFamily: 'GothamPro'
                    }}
                    value={count}
                    onChange={handleCountChange}
                />
            </FormControl>
            <React.Fragment>
            <Button
                disabled={!isConnect}
                sx={{
                    color: '#FFF',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontStyle: 'normal',
                    fontWeight: '700',
                    lineHeight: '18.264px',
                    letterSpacing: '0.24px',
                    textTransform: 'uppercase',
                    width: '210px',
                    height: '55px',
                    backgroundColor: '#5706FF',
                    borderRadius: '1000px',
                    boxShadow: '0px 20px 20px -8px rgba(62, 33, 255, 0.49)',
                    marginTop: '28px',
                    fontFamily: 'GothamPro'
                }}
            >
                {TEXT_CELL_CARD.btn}
            </Button>
                <Modal 
                    open={open} 
                    onClose={() => setOpen(false)}
                >
                    <ModalDialog
                        variant="plain" 
                        sx={{
                            width: "500px",
                            position: "relative",
                            borderRadius: "12px",
                            fontFamily: 'GothamPro'
                        }}
                    >
                        <ModalClose sx={{position:'absolute', top:'0', right:'0', opacity:'0.5'}}/>
                        <DialogTitle sx={{fontFamily: 'GothamPro'}}>
                            Confirmation
                        </DialogTitle>
                        <DialogContent sx={{display:'flex', flexDirection:'column', alignItems:"center", fontFamily: 'GothamPro'}}>
                            <div className="relative flex items-center w-[455px] justify-between mt-[40px]">
                                <div className="absolute left-0 top-[-23px]">
                                   <p className="text-[14px]">
                                        From
                                    </p> 
                                </div>
                                <div className="flex items-center">
                                   <Avatar size="sm" src="/eth.svg"/>
                                   <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                                        ETH
                                    </p>
                                </div>
                                <p className="text-[25px] text-[#FFF] tracking-[-0.64px]">
                                    Amount
                                </p>
                            </div>
                            <div className="relative flex items-center w-[455px] justify-between mt-[30px]">
                                <div className="absolute left-0 top-[-23px]">
                                   <p className="text-[14px]">
                                        To
                                    </p> 
                                </div>
                                <div className="flex items-center">
                                   <Avatar size="sm" src="/usdc.svg"/>
                                   <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                                        USDC
                                    </p>
                                </div>
                                <p className="text-[25px] text-[#FFF] tracking-[-0.64px]">
                                    Amount
                                </p>
                            </div>
                            <div className="flex flex-col items-center w-[455px] rounded-[12px] bg-[#141320] mt-[30px]">
                                <div className="flex items-center justify-between w-[415px] mt-[10px]">
                                    <p className="text-[16px]">
                                        Нижняя граница
                                    </p>
                                    <p className="text-[16px] text-[#FFF]">
                                        Цена
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-[415px] mt-[10px]">
                                    <p className="text-[16px]">
                                        Награды за день
                                    </p>
                                    <p className="text-[16px] text-[#FFF]">
                                        Кол-во
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-[415px] mt-[10px]">
                                    <p className="text-[16px]">
                                        Награды за неделю
                                    </p>
                                    <p className="text-[16px] text-[#FFF]">
                                        Кол-во
                                    </p>
                                </div>
                                <div className="flex items-center justify-between w-[415px] my-[10px]">
                                    <p className="text-[16px]">
                                        Награды за месяц
                                    </p>
                                    <p className="text-[16px] text-[#FFF]">
                                        Кол-во
                                    </p>
                                </div>
                            </div>
                            <Button
                                sx={{
                                    color: '#FFF',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '700',
                                    lineHeight: '18.264px',
                                    letterSpacing: '0.24px',
                                    textTransform: 'uppercase',
                                    width: '210px',
                                    height: '55px',
                                    backgroundColor: '#5706FF',
                                    borderRadius: '1000px',
                                    boxShadow: '0px 20px 20px -8px rgba(62, 33, 255, 0.49)',
                                    marginTop: '28px',
                                    fontFamily: 'GothamPro'
                                }}
                                onClick={() => setOpen(true)}
                            >
                            Подтвердить
                        </Button>
                        </DialogContent>
                    </ModalDialog>
                </Modal>
            </React.Fragment>
        </div>
    )
}

export default SellCard