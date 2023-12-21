"use client"
import React from "react"
import Image from "next/image"
import { Button }  from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Select, SelectItem} from "@nextui-org/select"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal"
 

export default function Home() {

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <div className="flex flex-col h-screen flex flex-col items-center"> 
      <div className=" flex flex-col items-center bg-white rounded-[15px] max-[466px]:w-11/12 max-[640px]:px-[15px] max-[640px]:pb-[15px] sm:w-[464px] sm:h-[263px] mt-[129px] max-[472px]:mx-[10px]">
        <div className="flex min-[466px]:flex-wrap max-[466px]:grid max-[466px]:grid-cols-1 items-center md:flex-nowrap max-[466px]:gap-[15px] gap-[43px] mt-[63px]">
          <Select variant="bordered" placeholder="Select an asset" className="w-[187px]" radius="lg" size="sm">
              <SelectItem key="ETH" value="ETH">
                  ETH
              </SelectItem>
              <SelectItem key="BTC" value="BTC">
                  BTC
              </SelectItem>
          </Select>
          <Select variant="bordered" placeholder="Select option" className="w-[187px]" radius="lg" size="sm">
              <SelectItem key="BUY" value="BUY">
                BUY
              </SelectItem>
              <SelectItem key="SELL" value="SELL">
                SELL
              </SelectItem>
          </Select>
        </div>
        <div className="flex min-[466px]:flex-wrap max-[466px]:grid max-[466px]:grid-cols-1 md:flex-nowrap max-[466px]:gap-[15px] gap-[41px] mt-[15px]">
            <Input type="number" label="Enter amount()"  variant="bordered" className="w-[187px]" radius="lg" size="sm" />
            <Input type="number" label="Set price()"  variant="bordered" className="w-[187px]" radius="lg" size="sm" />
        </div>
        <>
        <Button onPress={onOpen} className="bg-[#F9607CF0] text-white w-[185px] h-[36px] rounded-[15px] mt-[38px] font-semibold font-inter text-[16px]">View Order</Button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent className="flex flex-col items-center">
          {(onClose) => (
            <>
              <ModalHeader className="text-[#F9607C]">Your Position</ModalHeader>
              <ModalBody className="flex flex-row">
               <div className="text-right">
                <p> 
                You’II get: ()
                </p>
                <p>
                Average price of purchase: $
                </p>
                <p>
                Your reward in a day: $
                </p>
                <p>
                Your reward in a week: $
                </p>
                <p>
                Your reward in a month: $
                </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onPress={onClose}>
                  Change order
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirm order
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
        </>
      </div> 
    </div>      
  );
}