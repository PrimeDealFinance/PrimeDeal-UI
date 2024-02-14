"use client";
import React, { useEffect, useState } from "react";
import Button from "@mui/joy/Button";
import Chip from '@mui/joy/Chip';
import TradingViewWidget from "@/service/TradingView";
import ETH from "@/public/eth.svg";
import USDC from "@/public/usdc.svg";
import Image from "next/image";
import Avatar from "@mui/joy/Avatar";
import greenDot from "@/public/greenDot.svg"
import ProtectedRoute from "@/components/ProtectedRoute";

const OrderIdPage = () => {
    return (
        <div className="flex flex-col h-full flex flex-col items-center">
            <div className="flex flex-col items-center w-[1211px] relative h-[788px] rounded-[22px] bg-[#0A0914] z-[2] mt-[188px] mb-[123px]">
                <div className="absolute flex justify-between items-center top-[-58px] left-[0] w-[378px]">
                    <div className="flex">
                        <Image
                            src={ETH}
                            alt=""
                            width={29}
                            height={29}
                        />
                        <p className="color-[#FFF] text-[32px] font-normal tracking-[-0.64px] ml-[11px]">
                            ETH
                        </p>
                    </div>
                    <Chip
                        variant="plain"
                        size="lg"
                        sx={{color:'#6FEE8E', background:'transparent'}}
                        startDecorator={
                            <Avatar 
                                src='/greenDot.svg'
                                sx={{width:'8px', height:'8px'}}
                            />
                        }
                    >
                        In range
                    </Chip>
                    <div className="flex justify-center items-center w-[168px] h-[31px] rounded-[1000px] bg-[#FFFFFF2B]">
                        <p className="text-[12px] tracking-[0.12px]">
                            Текущая цена: $2457
                        </p>
                    </div>
                </div>
                <div className="flex justify-between items-center w-[1120px] h-[425px] mt-[50px]">
                    <div className="flex flex-col items-center justify-center w-[489px] h-[368px] bg-[#5706FF]">
                        Сюда график
                    </div>
                    <div className="flex flex-col item-center justify-between">
                        <div className="flex flex-col items-center w-[568px] h-[206px] rounded-[13px] bg-[#141320]">
                            <div className="flex justify-between items-start w-[520px] mt-[18px]"> 
                                <div className="flex flex-col items-start">
                                    <div className="text-[#8A8997] text-[14px] tracking-[0.14px]">
                                        Order balance
                                    </div>
                                    <div className="text-[32px] tracking-[-1.28px] leading-[48.7px]">
                                        $40,000
                                    </div>
                                </div>
                                <Button sx={{
                                    color:"#FFF",
                                    backgroundColor:"#5706FF",
                                    width:"156px",
                                    height:"50px",
                                    borderRadius:"1000px",
                                    boxShadow:"0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '700',
                                    lineHeight: '152.2%',
                                    letterSpacing: '0.24px'

                                }}>
                                    CLOSE ORDER
                                </Button>
                            </div>
                            <div className="flex justify-between items-center w-[517px] mt-[23.5px]">
                                <div className="flex items-center">
                                    <Image
                                        src={USDC}
                                        alt=""
                                        width={30}
                                        height={30}                                
                                    />
                                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                                        USDC
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[16px] tracking-[0.16px] opacity-50 mr-[33px]">
                                        13,000
                                    </p>
                                    <p className="text-[16px] tracking-[0.16px] opacity-50">
                                        0.32%
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center  w-[517px] mt-[7.6px]">
                            <div className="flex items-center">
                                    <Image
                                        src={ETH}
                                        alt=""
                                        width={30}
                                        height={30}                                
                                    />
                                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                                        ETH
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-[16px] tracking-[0.16px] opacity-50 mr-[33px]">
                                        1.4
                                    </p>
                                    <p className="text-[16px] tracking-[0.16px] opacity-50">
                                        0.68%
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center w-[568px] h-[206px] rounded-[13px] bg-[#141320] mt-[13px]">
                            <div className="flex justify-between items-start w-[520px] mt-[18px]"> 
                                <div className="flex flex-col items-start">
                                    <div className="text-[#8A8997] text-[14px] tracking-[0.14px]">
                                        Fee balance
                                    </div>
                                    <div className="text-[32px] tracking-[-1.28px] leading-[48.7px]">
                                        $235.14
                                    </div>
                                </div>
                                <Button sx={{
                                    color:"#FFF",
                                    backgroundColor:"#5706FF",
                                    width:"156px",
                                    height:"50px",
                                    borderRadius:"1000px",
                                    boxShadow:"0px 20px 20px -8px rgba(62, 33, 255, 0.49)",
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '700',
                                    lineHeight: '152.2%',
                                    letterSpacing: '0.24px'

                                }}>
                                    CLAIM FEES
                                </Button>
                            </div>
                            <div className="flex justify-between items-center w-[517px] mt-[23.5px]">
                                <div className="flex items-center">
                                    <Image
                                        src={USDC}
                                        alt=""
                                        width={30}
                                        height={30}                                
                                    />
                                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                                        USDC
                                    </p>
                                </div>
                                <p className="text-[16px] tracking-[0.16px] opacity-50">
                                    141.06
                                </p>
                            </div>
                            <div className="flex justify-between items-center  w-[517px] mt-[7.6px]">
                                 <div className="flex items-center">
                                    <Image
                                        src={ETH}
                                        alt=""
                                        width={30}
                                        height={30}                                
                                    />
                                    <p className="text-[14px] tracking-[0.14px] opacity-50 ml-[12px]">
                                        ETH
                                    </p>
                                </div>
                                <p className="text-[16px] tracking-[0.16px] opacity-50">
                                    0.68%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative flex justify-between mt-[134px] w-[1120px] h-[139px]">
                    <div className="absolute top-[-56px] left-0"> 
                        <p className="text-[32px] font-bold tracking-[-0.64px]">
                            Аналитика
                        </p>
                    </div>
                    <div className="flex flex-col items-start w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
                        <p className="mb-[4px] mt-[25px] ml-[30px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                            Средняя цена покупки
                        </p> 
                        <p className="mb-[3px] ml-[30px] text-[24px] tracking-[-0.48px] leading-[36.528px]">
                            $253.45
                        </p>
                        <div className="flex ml-[30px] items-center">
                            <div>
                                <Image
                                    src={USDC}
                                    alt=""
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <div className="absolute left-[45px] bottom-[19px]">
                                <Image 
                                    src={ETH}
                                    alt=""
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <p className="opacity-50 ml-[23.5px] text-[14px] tracking-[0.14px]">
                                ETH за USDC
                            </p>
                        </div>
                    </div>
                    <div className="relative flex flex-col items-start w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
                        <p className="mb-[4px] mt-[25px] ml-[30px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                            Доходность
                        </p>
                        <div className="flex items-center mb-[3px] ml-[30px] ">
                            <p className="text-[#6FEE8E]">+</p>
                            <p className="text-[24px] tracking-[-0.48px] leading-[36.528px]">
                                $253.45
                            </p>
                        </div>
                        <div className="flex ml-[30px] items-center">
                            <div>
                                <Image
                                    src={USDC}
                                    alt=""
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <div className="absolute left-[45px] bottom-[19px]">
                                <Image 
                                    src={ETH}
                                    alt=""
                                    width={30}
                                    height={30}
                                />
                            </div>
                            <p className="opacity-50 ml-[23.5px] text-[14px] tracking-[0.14px]">
                                ETH за USDC
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start w-[364px] h-[139px] rounded-[13px] bg-[#141320]">
                        <p className="mb-[8px] mt-[27px] ml-[32px] text-[#8A8997] text-[14px] tracking-[0.14px]">
                            Выбранный диапазон
                        </p>
                        <div className="flex ml-[32px]">
                            <div className="flex flex-col items-start">
                                <p className="text-[24px] tracking-[-0.48px] leading-[36.528px] mb-[8px]">
                                    $253.45
                                </p>
                                <p className="opacity-50 text-[14px] tracking-[0.14px]">
                                    Мин. цена
                                </p>
                            </div>
                            <p className="text-[24px] font-bold leading-[36.582px] mx-[21px] opacity-30">
                                -
                            </p>
                            <div className="flex flex-col items-start">
                                <p className="text-[24px] tracking-[-0.48px] leading-[36.528px] mb-[8px]">
                                    $253.45
                                </p>
                                <p className="opacity-50 text-[14px] tracking-[0.14px]">
                                    Макс. цена
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProtectedRoute(OrderIdPage);