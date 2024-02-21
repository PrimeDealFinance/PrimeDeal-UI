import * as React from 'react';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog, { ModalDialogProps } from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Link from '@mui/joy/Link';
import Warning from '@mui/icons-material/Warning';
import CircularProgress from '@mui/joy/CircularProgress';
import "@/app/font.css";




interface Props {
    isOpenAlertError: boolean;
    onOpenAlertError: () => void;
}

export default function AlertError({
    onOpenAlertError,
    isOpenAlertError
  }: Props) {
    
  return (
    <React.Fragment>
      <Stack direction="row" alignItems="center" spacing={1}>
      </Stack>
      <Modal open={isOpenAlertError} onClose={onOpenAlertError}>
        <ModalDialog 
            variant="solid" 
            color='danger' 
            invertedColors
            sx={{
              borderRadius: '12px',
              position: 'relative',
              width: '300px',
              fontFamily: 'GothamPro'
            }}
          >
          <ModalClose />
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CircularProgress 
              size='md'
            >
              <Warning/>
            </CircularProgress>
            Rejected
          </DialogTitle>
          <DialogContent>
          <p></p>
          <p>Unfortunately, the transaction was canceled.</p>
          <p></p>
          <p>Please try again.</p>
          <p></p>
          </DialogContent>
        </ModalDialog>
       
      </Modal>
      
    </React.Fragment>
  );
}