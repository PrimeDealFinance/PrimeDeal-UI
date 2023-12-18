import React from "react";
import {Card, CardFooter, Image, Button} from "@nextui-org/react";

interface Props {
    onClickConnect: () => void;
  }

const StartPage = ({
    onClickConnect,
  }: Props) => {

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
                onClick={onClickConnect}>
          Connect
        </Button>
      </CardFooter>
    </Card>
   </>
    )
  };
  export default StartPage;