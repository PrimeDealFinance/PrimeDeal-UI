import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Link} from "@nextui-org/react";

interface Props {
    isOpenModalTx: boolean;
    onOpenModalTx: () => void;
    miniTxhash: string;
    hashLinkPlus: string;

}

const CommonModalWindow = ({
  onOpenModalTx,
  isOpenModalTx,
  miniTxhash,
  hashLinkPlus
}: Props) => {

  return (
    <Modal isOpen={isOpenModalTx} onOpenChange={onOpenModalTx}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Tx in progress</ModalHeader>
          <ModalBody>
          <p></p>
          <p>Please, wait a few seconds</p>
          <p></p>
          <p>or check your tx, via the link below:</p>
          <Link target='_blank' href={hashLinkPlus}>{miniTxhash}</Link>
          {/* <a target='_blank' href={hashLinkPlus}>{miniTxhash}</a> */}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenModalTx}>
              Close
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
  );
}
export default CommonModalWindow;