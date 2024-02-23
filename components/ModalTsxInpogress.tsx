import * as React from 'react';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog, { ModalDialogProps } from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import LinearProgress from '@mui/joy/LinearProgress';
import Link from '@mui/joy/Link';
import "@/app/font.css";

interface Props {
    isOpenModalTx: boolean;
    onOpenModalTx: () => void;
    miniTxhash: string;
    hashLinkPlus: string;

}

export default function ModalTsxInprogress({
    onOpenModalTx,
    isOpenModalTx,
    miniTxhash,
    hashLinkPlus
  }: Props) {
    
  return (
    <React.Fragment>
      <Stack direction="row" alignItems="center" spacing={1}>
      </Stack>
      <Modal open={isOpenModalTx} onClose={onOpenModalTx}>
        <ModalDialog 
            variant="plain"
            sx={{
              borderRadius: '12px',
              fontFamily: 'GothamPro'
            }}
          >
          <ModalClose />
          <DialogTitle>Tx in progress</DialogTitle>
          <DialogContent>
          <p></p>
          <p>Please, wait a few seconds</p>
          <p></p>
          <p>or check your tx, via the link below:</p>
          <Link target='_blank' href={hashLinkPlus}>{miniTxhash}</Link>
          </DialogContent>
          <LinearProgress
          variant="solid"
          value={40}
          sx={{
            color: '#5706FF',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: '12px',
            "--LinearProgress-radius": "12px",
            "--LinearProgress-progressRadius": "12px",
            background: '#0A0914'
          }}
        />
        </ModalDialog>
       
      </Modal>
      
    </React.Fragment>
  );
}