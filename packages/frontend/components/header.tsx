"use client";
import { useState } from "react";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import Logo from "@/public/logo_w3a.svg";
import { Button } from "@nextui-org/react";
import Owl from "@/public/owl.svg";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  DropdownSection,
} from "@nextui-org/dropdown";
import ConnectButton from "./ConnectButton"; 
import { useWalletStore } from "@/service/store";
import SwitchNetworkDropdown from "./networkDropdown";


const Header = () => {

  const { isConnect, handleConnectNotice } = useWalletStore();

  return (
    <div className="sticky top-0 z-10 flex justify-center relative shadow-lg h-[85px] items-center bg-[#6078F9]">
      <Link
        href={"/"}
        className="max-[960px]:invisible flex absolute items-center left-[36px]"
      >
        <Image src={Logo} alt={""} height={40}></Image>
      </Link>
      <div className="max-[960px]:invisible flex flex-row justify-between content-center">
        <Link
          href={"/"}
          className="font-inter text-white hover:text-[#FFFFFF8F] font-bold text-[24px] not-italic"
        >
          Create Order
        </Link>
        <Image src={Owl} alt={""} height={42} className="mx-[13px]" />
        {!isConnect ? (
          <Link
            href=""
            onClick={handleConnectNotice}
            className="font-inter text-white hover:text-[#FFFFFF8F] font-bold text-[24px] not-italic"
          >
            Your Orders
          </Link>
        ) : (
          <Link
            href="/orders"
            className="font-inter text-white hover:text-[#FFFFFF8F] font-bold text-[24px] not-italic"
          >
            Your Orders
          </Link>
        )}
      </div>
      <div className="min-[960px]:invisible flex absolute left-[17px]">
        <Dropdown>
          <DropdownTrigger>
            <Image src={"/burger.svg"} alt="" width={40} height={40}></Image>
          </DropdownTrigger>
          <DropdownMenu aria-label="menu" variant="light">
            <DropdownSection showDivider>
              <DropdownItem>
                <Link href={"/"} className="font-inter">
                  Create Order
                </Link>
              </DropdownItem>
            </DropdownSection>
            <DropdownItem>
              <Link href={"/orders"} className="font-inter">
                Your Orders
              </Link>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div className="absolute right-[170px]">
          <SwitchNetworkDropdown />
      </div>
      <div className="absolute right-[17px]">
        <ConnectButton />
      </div>
    </div>
  );
};
export default Header;
