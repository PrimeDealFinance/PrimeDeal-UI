import React from "react"
import Avatar from '@mui/joy/Avatar';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import Select, { SelectOption } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';

const options = [
    { value: 'eth', label: 'ETH', src: '/eth.svg' },
    { value: 'matic', label: 'MATIC', src: '/matic.svg' },
  ];

 
const BuyCard = () => {
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
                    marginTop:'38px',
                    backgroundColor:'#0A0914'
                }}
              
                >
                    {options.map((option, index) => (
                        <React.Fragment key={option.value}>
                        {index !== 0 ? <ListDivider role="none" inset="startContent" /> : null}
                            <Option value={option.value} label={option.label} sx={{borderRadius:'100px'}}>
                                <ListItemDecorator>
                                    <Avatar size="sm" src={option.src} />
                                </ListItemDecorator>
                                {option.label}
                            </Option>
                        </React.Fragment>
                    ))}
            </Select>
            <div className="flex w-[464px] h-[160px] justify-between mt-[50px]">
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
        </div>
    )
}

export default BuyCard