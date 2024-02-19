'use client'
import { useWalletStore } from "@/service/store";
import Image from "next/image";
import MainButton from "@/components/MainButton";
import logo from "@/public/PrimeDeal.svg"
import Link from "next/link";
import { Background } from "@/components/Background";
import { useRouter } from "next/navigation";
import "@/app/font.css";

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
      <Background />
      {children}
    </main>
  );
}