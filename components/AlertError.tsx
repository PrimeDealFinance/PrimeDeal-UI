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
        <ModalDialog variant="solid">
          <ModalClose />
          <DialogTitle>Rejected</DialogTitle>
          <DialogContent>
          <p></p>
          <p>Unfortunately, the transaction was canceled.</p>
          <p></p>
          <p>Please try again.</p>
          <p></p>
          </DialogContent>
          <LinearProgress
          variant="solid"
          color="danger"
          value={40}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
          }}
        />
        </ModalDialog>
       
      </Modal>
      
    </React.Fragment>
  );
}