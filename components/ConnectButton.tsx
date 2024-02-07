'use client'
import React from "react";
import { useWalletStore } from "@/service/store";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles"

const CustomButton = styled(Button)({
  borderRadius: '1000px',
  boxShadow: 'none',
  textTransform: 'none',
  fontSize: '12px',
  fontStyle: 'normal',
  fontWeight: '400',
  color: '#FFFFFF',
  letterSpacing: '-0.54px',
  width: '160px',
  height: '48px',
  border: '1px solid',
  lineHeight: 1.5,
  backgroundColor: '#010306',
  borderColor: '#5606FF',
  fontFamily: [
    'Gotham',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  '&:hover': {
    backgroundColor: '#5606FF',
    borderColor: '#010306',
    boxShadow: 'none',
  },
  '&:active': {
    boxShadow: 'none',
    backgroundColor: '#5606FF[700]',
    borderColor: '#005cbf[700]',
  },
})

const ConnectButton = () => {
  const {
    handleIsConnected,
    isConnect,
    account,
    disconnectWallet,
  } = useWalletStore();
  const miniText = account ? account.substring(0, 4) + "..." + account.slice(38) : ""; 

  const handleButtonClick = () => {
    if (isConnect) {
      disconnectWallet(); 
    } else {
      handleIsConnected(); 
    }
  };


  return (
    <CustomButton variant="outlined" onClick={handleButtonClick}>
      {isConnect ? miniText : "CONNECT WALLET"} 
    </CustomButton>
  );
};

export default ConnectButton;