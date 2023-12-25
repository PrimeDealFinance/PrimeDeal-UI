import React from "react";
//import { Modal, Input, Row, Checkbox, Button, Text } from "@nextui-org/react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";

interface Props {
  isConnect: boolean;
  isOpenModalConnect: boolean;
  onOpenChange: () => void;
  onClickConnect: (abiContract:any, IUniswapV3PoolABI:any) => void;


}

const ModalWindowConnect = ({
  isConnect,
  onOpenChange,
  onClickConnect,
  isOpenModalConnect
}: Props) => {

  return (
    <Modal isOpen={isOpenModalConnect} onOpenChange={onOpenChange}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Something wrong</ModalHeader>
          <ModalBody>
            <p>Please, connect your MemaMask</p>
            <p>to use the App</p>
            <p></p>
           
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenChange}>
              Close
            </Button>
            <Button color="primary" onPress={() => onClickConnect}>
              Connect
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
  );
}
export default ModalWindowConnect;