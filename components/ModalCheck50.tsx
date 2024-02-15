import React, { useState } from "react";
import {
    Button,
    Modal,
    ModalDialog,
    ModalClose,
    DialogTitle,
    DialogContent
} from '@mui/joy';

interface Props {
    openModal50: boolean;
    onOpenModal50: () => void;
}

const ModalCheck50 = ({
    openModal50,
    onOpenModal50
  }: Props) => {
    return (
        <>
        <Modal 
                    open={openModal50} 
                    onClose={onOpenModal50}
                >
                    <ModalDialog
                        variant="plain" 
                        sx={{
                            width: "500px",
                            position: "relative",
                            borderRadius: "12px"
                        }}
                    >
                        <ModalClose sx={{position:'absolute', top:'-40px', right:'0', opacity:'0.3'}}/>
                        <DialogTitle>
                            Sorry
                        </DialogTitle>
                        <DialogContent sx={{display:'flex', flexDirection:'column', alignItems:"center"}}>
                            <div className="relative flex items-center w-[455px] justify-between mt-[40px]">
                                <div className="flex items-center">
                                   <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                                   At this stage, it is an experimental tool.
                                    </p>
                                </div>
                            </div>
                            <div className="relative flex items-center w-[455px] justify-between mt-[30px]">
                                <div className="flex items-center">
                                   <p className="text-[25px] text-[#FFF] ml-[5px] tracking-[-0.64px]">
                                    You can open a position of no more than $ 50
                                    </p>
                                </div>
                            </div>
                          
                            <Button
                                sx={{
                                    color: '#FFF',
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    fontStyle: 'normal',
                                    fontWeight: '700',
                                    lineHeight: '18.264px',
                                    letterSpacing: '0.24px',
                                    textTransform: 'uppercase',
                                    width: '210px',
                                    height: '55px',
                                    backgroundColor: '#5706FF',
                                    borderRadius: '1000px',
                                    boxShadow: '0px 20px 20px -8px rgba(62, 33, 255, 0.49)',
                                    marginTop: '28px'
                                }}
                                onClick={onOpenModal50}
                            >
                            Reduce amount
                        </Button>
                        </DialogContent>
                    </ModalDialog>
                </Modal>
                </>
    )
}
export default ModalCheck50;