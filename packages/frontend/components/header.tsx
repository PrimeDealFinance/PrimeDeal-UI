import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo_w3a.svg";
import Owl from "@/public/owl.svg";
import {Button} from "@nextui-org/react";

interface Props {
  onClickConnect: () => void;
  isConnect: boolean;
  account: string;

}

const Header = ({
  onClickConnect,
  isConnect,
  account
}: Props) => {

  const miniText: string = (account).substring(0, 4) + '...' + (account).slice(38);

  return (
    <div className="flex justify-center relative shadow-lg h-[85px] items-center bg-[#6078F9]">
      <Link href={"/"} className="flex absolute items-center left-[36px]">
        <Image src={Logo} alt={""} height={40}></Image>
      </Link>
      <div className="flex flex-row justify-between items-center">
          <Link href={"/"}  className="font-inter text-white hover:text-[#FFFFFF8F] font-bold text-[24px] not-italic">
            Create Order
          </Link>
          <Image src={Owl} alt={""} height={42} className="mx-[13px]"/>
          <Link href={"/orders"}  className="font-inter text-white hover:text-[#FFFFFF8F] font-bold text-[24px] not-italic">
            Your Orders
          </Link>
      </div>

        <div className="absolute right-[17px]">       
        {!isConnect ?
        <Button color="danger" size="lg"
        onClick={onClickConnect} >
           Connect
        </Button>
        :
        <Button color="danger" size="lg"
       >
          {miniText} 
        </Button>
         }
        </div>
      
    </div>
  );
};
export default Header;