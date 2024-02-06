import { AlchemyProvider } from "ethers";
import { InfuraProvider, JsonRpcProvider } from "ethers/providers";

const defaultProvider = new InfuraProvider("matic-mumbai");

export default defaultProvider;
