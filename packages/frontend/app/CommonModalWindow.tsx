import React from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";

interface Props {
    isOpenCommonModal: boolean;
    onOpenCommonChange: () => void;
    contentCommonModal: string;

}

const CommonModalWindow = ({
  onOpenCommonChange,
  isOpenCommonModal,
  contentCommonModal
}: Props) => {

  return (
    <Modal isOpen={isOpenCommonModal} onOpenChange={onOpenCommonChange}>
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Something wrong</ModalHeader>
          <ModalBody>
            {contentCommonModal}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onOpenCommonChange}>
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