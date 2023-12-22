import React, {useEffect, useState} from "react";
import { Contract, ethers } from "ethers";
import defaultProvider from "../defaultProvider";
import abiContract from "../abiContract";
const { abi: INonfungiblePositionManagerABI } = require('@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json');




const anyBalance = () => {
    console.log("defaultP: ", defaultProvider);
    const [balan, setBalan] = useState("");
    const [nonPosMan, setNonPosMan] = useState<any>("");
    const [contractView, setContractView] = useState<any>("");
    const addressContract = "0x7E3DBB135BdFF8E3b72cFefa48da984F3bdB833a";
    const nonfungiblePositionManager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
    const myId = 206339;

    useEffect(() => {
      (async () => {
        const balance: bigint = await defaultProvider.getBalance(
          "0xF687212015A7DD203741CAe1b7f5aB5A846a4023"
        );
        const balanceETH = ethers.formatEther(balance);
        console.log("balanceP: ", balanceETH);
        setBalan(balanceETH);
        const contractView = new Contract(
          addressContract,
          abiContract,
          defaultProvider
        );
        setContractView(contractView);
        //const usePositions = await contractView.owner2Positions("0xF687212015A7DD203741CAe1b7f5aB5A846a4023");
        //console.log("usePositions: ", usePositions);

        const contractNonfungiblePositionManager = new Contract(
            nonfungiblePositionManager,
            INonfungiblePositionManagerABI,
            defaultProvider
        )
        setNonPosMan(contractNonfungiblePositionManager);

        const infoPosition = await contractNonfungiblePositionManager.positions(myId);
        console.log("infoPosition0: ", infoPosition[0]);
        console.log("infoPosition1: ", infoPosition[1]);
        console.log("infoPosition2: ", infoPosition[2]);
        console.log("infoPosition3: ", infoPosition[3]);
        console.log("infoPosition4: ", infoPosition[4]);
        console.log("infoPosition5: ", infoPosition[5]);
        console.log("infoPosition6: ", infoPosition[6]);
        console.log("infoPosition7liq: ", ethers.formatEther(infoPosition[7]));
        console.log("infoPosition8: ", infoPosition[8]);
        console.log("infoPosition9: ", infoPosition[9]);
        console.log("infoPosition10fee: ", ethers.formatEther(infoPosition[10]));
        console.log("infoPosition11fee: ", ethers.formatEther(infoPosition[11]));

        const openPositions = await contractView.getOpenPositions("0xF687212015A7DD203741CAe1b7f5aB5A846a4023");
        console.log("openPositions: ", openPositions[0][0]);

      })();
    }, []);

  };
  export default anyBalance;

