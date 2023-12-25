import React from "react";
import { Button } from "@nextui-org/react";
import { useWalletStore } from "@/service/store";
import abiContract from "@/app/abiContract";
import abiUsdt from "@/app/abiContract";
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");

const ConnectButton = () => {
  const {
    handleIsConnected,
    isConnect,
    account,
    handleConnectNotice,
  } = useWalletStore();
  const miniText = account.substring(0, 4) + "..." + account.slice(38);

  return (
    <>
      {!isConnect ? (
        <Button
          color="danger"
          size="lg"
          onClick={() =>
            handleIsConnected(abiContract, abiUsdt, IUniswapV3PoolABI)
          }
        >
          Connect
        </Button>
      ) : (
        <Button color="danger" size="lg">
          {miniText}
        </Button>
      )}
    </>
  );
};

export default ConnectButton;
