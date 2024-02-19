'use client'
import React from "react";
import { useWalletStore } from "@/service/store";
import Image from "next/image";
import MainButton from "@/components/MainButton";
import logo from "@/public/PrimeDeal.svg"
import Link from "next/link";
import { Background } from "@/components/Background";
import { useRouter } from "next/navigation";
import "@/app/font.css";
import Drawer from '@mui/joy/Drawer';
import MediaQuery from 'react-responsive';
import { Button } from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";
import Burger from "@/public/burger.svg"

export default function MainPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    handleIsConnected,
    isConnect,
    account,
    disconnectWallet,
  } = useWalletStore();
  const router = useRouter()
  const miniText = account ? account.substring(0, 4) + "..." + account.slice(38) : "";

  const handleConnectClick = () => {
    if (isConnect) {
      disconnectWallet();
      router.push('/')
    } else {
      handleIsConnected();
    }
  };

  const [open, setOpen] = React.useState(false);

  const toggleDrawer =
    (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setOpen(inOpen);
    };
  
  return (
    <main className="dark h-full flex flex-col relative text-foreground bg-[#010306] z-[0]">
      <div className="z-[2]">
        <Link href={'/'}>
          <Image
            src={logo}
            alt="logo"
            width={88}
            height={14}
            className="w-auto absolute top-[45.07px] left-[70.34px] max-[767px]:top-[20.07px] max-[767px]:left-[50.34px]" />
        </Link>
      </div>
      <MediaQuery minWidth={521}>
        <div className="absolute top-[35px] z-[2] right-[70px] max-[1110px]:right-[-40px] max-[767px]:top-[10px]">
          <MainButton text={isConnect ? miniText : "CONNECT WALLET"} handleConnectClick={handleConnectClick} />
        </div>
        <div className="absolute top-[90px] z-[2] right-[70px] max-[1110px]:right-[-40px] max-[767px]:top-[10px] max-[767px]:right-[130px] font-['GothamPro']">
          {isConnect &&
            <Link href={'/orders'}>
              <MainButton text={"MY ORDERS"} />
            </Link>
          }
        </div>
      </MediaQuery>
      <MediaQuery maxWidth={520}>
        <div className="absolute top-[35px] z-[2] right-[70px] max-[1110px]:right-[10px] max-[767px]:top-[10px]">
          <Button 
            onClick={toggleDrawer(true)}
            sx={{
              width: '100px',
              height: '35px'
            }}
            variant="plain"
          >
            <Image 
              src={Burger}
              alt=""
              width={20}
              height={20}
            />
          </Button>
          <Drawer
            open={open} 
            onClose={toggleDrawer(false)}
            anchor="right"
            size="sm"
          >
            <ModalClose/>
            <div className="mt-[20px]">
              <MainButton text={isConnect ? miniText : "CONNECT WALLET"} handleConnectClick={handleConnectClick} />
            </div>
            <div className="mt-[60px] font-['GothamPro']">
              {isConnect &&
                <Link href={'/orders'}>
                  <MainButton text={"MY ORDERS"} />
                </Link>
              }
            </div>
          </Drawer>
        </div>
      </MediaQuery>
      <Background />
      {children}
    </main>
  );
}