import { useWalletStore } from "../service/store";
import React from "react";

const TestWalletComponent = () => {
  const { disconnectWallet, isConnect, account } = useWalletStore();
  return (
    <div>
      <button onClick={disconnectWallet}>Disconnect Wallet</button>
      <div data-testid="isConnect">{isConnect.toString()}</div>
      <div data-testid="account">{account}</div>
    </div>
  );
};

export default TestWalletComponent;
