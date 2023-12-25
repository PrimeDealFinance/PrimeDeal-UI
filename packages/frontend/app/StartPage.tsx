import React from "react";
import {Card, CardFooter, Image, Button} from "@nextui-org/react";
import {useWalletStore} from "@/service/store"
const {
  abi: IUniswapV3PoolABI,
} = require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json");
import abiContract from "./abiContract";




const StartPage = () => {

  const { handleIsConnected } = useWalletStore();

    return (
       <>
      
      <Card
      isFooterBlurred
      radius="lg"
      className="border-none"
    >
      <Image
        alt="Owl"
        className="object-cover"
        height={300}
        src="/glazasovi.jpeg"
        width={300}
      />
      <CardFooter className="justify-between before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
        <p className="ext-large text-red-500">Welcome to Owls</p>
        <Button className="text-large text-red-500 bg-black/20" variant="flat" color="default" radius="lg" size="md"
                onClick={() => handleIsConnected(abiContract, IUniswapV3PoolABI)}>
          Connect
        </Button>
      </CardFooter>
    </Card>
   </>
    )
  };
  export default StartPage;