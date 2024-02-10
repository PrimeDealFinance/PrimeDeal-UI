import React, { useState } from "react"
import Avatar from '@mui/joy/Avatar';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import Select, { SelectOption } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';
import Plus from '@mui/icons-material/AddCircleOutline';
import Minus from "@mui/icons-material/RemoveCircleOutline"
import IconButton from '@mui/joy/IconButton';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';

const options = [
    { value: 'eth', label: 'ETH', src: '/eth.svg' },
    { value: 'matic', label: 'MATIC', src: '/matic.svg' },
];

const BuyCard = () => {
    const [count, setCount] = useState(0)
    const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value);
        if (!isNaN(newValue)) {
            setCount(newValue)
        }
    }
    return (
        <div className="flex relative flex-col items-center bg-[#0A0914] w-[540px] h-[621px] rounded-[32px]">

            <Select
                indicator={<KeyboardArrowDown />}
                defaultValue='eth'
                slotProps={{
                    listbox: {
                        sx: {
                            borderRadius: '12px'
                        },
                    },
                }}
                sx={{
                    width: '476px',
                    height: '50px',
                    borderRadius: '100px',
                    marginTop: '38px',
                    backgroundColor: '#0A0914'
                }}

            >
                {options.map((option, index) => (
                    <React.Fragment key={option.value}>
                        {index !== 0 ? <ListDivider role="none" inset="startContent" /> : null}
                        <Option value={option.value} label={option.label} sx={{ borderRadius: '100px', width: '456px', marginLeft: '10px' }}>
                            <ListItemDecorator>
                                <Avatar size="sm" src={option.src} />
                            </ListItemDecorator>
                            {option.label}
                        </Option>
                    </React.Fragment>
                ))}
            </Select>
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
                            indicator={<KeyboardArrowDown />}
                            defaultValue='usdc'
                            variant="plain"
                            slotProps={{
                                listbox: {
                                    variant: 'outlined',
                                    sx: {
                                        borderRadius: '12px',
                                    },
                                },
                            }}
                            startDecorator={
                                <React.Fragment>
                                    <Avatar size="sm" src="/usdc.svg" />
                                </React.Fragment>
                            }
                        >
                            <Option value="usdc" sx={{ borderRadius: '100px', width: '115px', marginLeft: '5px' }}>
                                <Avatar size="sm" src="/usdc.svg" />
                                USDC
                            </Option>
                        </Select>
                    </React.Fragment>
                }
                sx={{
                    width: '476px',
                    height: '50px',
                    borderRadius: '100px',
                    marginTop: '59px',
                    backgroundColor: '#0A0914'
                }}
            />
            <FormControl sx={{ marginTop: '21px' }}>
                <FormLabel
                    sx={{
                        color: "#8A8997",
                        fontSize: "12px",
                        fontWeight: "normal",
                        letterSpacing: "0.12px"
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
                    value={count}
                    onChange={handleCountChange}
                    sx={{
                        width: '476px',
                        height: '50px',
                        borderRadius: '100px',
                        backgroundColor: '#0A0914'
                    }}
                />
            </FormControl>
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
                    marginTop: '28px'
                }}
            >
                Create Order
            </Button>
        </div>
    )
}

export default BuyCard
