import Image from "next/image";
import React from "react";
import Link from "next/link";
import Logo from "@/public/logo_w3a.svg";

const Footer = () => {
    return (
        <div className="sticky bottom-0 z-10 min-[960px]:invisible flex justify-center relative shadow-lg h-[85px] items-center bg-[#6078F9] mt-[100px]">
            <Link href={"/"} className="flex absolute items-center right-[36px]">
                <Image src={Logo} alt={""} height={40}></Image>
            </Link>
        </div>
    );

};

export default Footer