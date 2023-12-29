import React from "react";
import { Button } from "@nextui-org/react";
import { useWalletStore } from "@/service/store";

const ConnectButton = () => {
  const {
    handleIsConnected,
    isConnect,
    account,
    disconnectWallet,
  } = useWalletStore();
  const miniText = account ? account.substring(0, 4) + "..." + account.slice(38) : ""; // Убедитесь, что account существует

  const handleButtonClick = () => {
    if (isConnect) {
      disconnectWallet(); // Вызывает функцию отключения, если уже подключен
    } else {
      handleIsConnected(); // Пытается подключиться, если не подключен
    }
  };

  return (
    <Button color="danger" size="lg" onClick={handleButtonClick}>
      {isConnect ? miniText : "Connect"} {/* Изменяет текст в зависимости от состояния */}
    </Button>
  );
};

export default ConnectButton;