import { create } from "zustand";
import { ethers } from "ethers";

interface WalletState {
  isConnect: boolean;
  account: string;
  provider: ethers.BrowserProvider | any;
  signer: ethers.Signer | null;
  network: ethers.Network | null;
  isOpenCommonModal: boolean;
  contentCommonModal: string;
  isOpenModalConnect: boolean;
  poolAddressUSDT_BTC: string;
  addressContract: string;
  addressUSDTContract: string;
  uniswapV3PoolETH_USDC: ethers.Contract | any;
  uniswapV3PoolUSDT_BTC: ethers.Contract | any;
  contractSigner: ethers.Contract | any;
  usdtSigner: ethers.Contract | any;
  poolAddress: string;
  setIsOpenModalConnect: (isOpen: boolean) => void;
  setIsOpenCommonModal: (isOpen: boolean) => void;
  setContentCommonModal: (content: string) => void;
  setIsConnect: (isConnect: boolean) => void;
  setAccount: (account: string) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  setNetwork: (network: ethers.Network | null) => void;
  setUniswapV3PoolETH_USDC: (contract: ethers.Contract | any) => void;
  setUniswapV3PoolUSDT_BTC: (contract: ethers.Contract | any) => void;
  setContractSigner: (signer: ethers.Contract | any) => void;
  setUsdtSigner: (signer: ethers.Contract | any) => void;
  handleIsConnected: (
    abiContract: any,
    abiUsdt: any,
    IUniswapV3PoolABI: any
  ) => Promise<void>;
  handleConnectNotice: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnect: false,
  account: "",
  provider: "",
  signer: null,
  network: null,
  isOpenCommonModal: false,
  contentCommonModal: "Error",
  uniswapV3PoolETH_USDC: "",
  uniswapV3PoolUSDT_BTC: "",
  contractSigner: "",
  usdtSigner: "",
  poolAddress: "0xeC617F1863bdC08856Eb351301ae5412CE2bf58B",
  poolAddressUSDT_BTC: "0x7E3DBB135BdFF8E3b72cFefa48da984F3bdB833a",
  addressContract: "0x5ce832046e25fBAc5De4519f4d3b8052EDA5Fa86",
  addressUSDTContract: "0x9efE3B3d2C516970B902364444411103d077160D",
  isOpenModalConnect: false,
  setIsOpenModalConnect: (isOpen) => set({ isOpenModalConnect: isOpen }),
  setIsConnect: (isConnect) => set(() => ({ isConnect })),
  setAccount: (account) => set(() => ({ account })),
  setProvider: (provider) => set(() => ({ provider })),
  setSigner: (signer) => set(() => ({ signer })),
  setNetwork: (network) => set(() => ({ network })),
  setIsOpenCommonModal: (isOpen) => set({ isOpenCommonModal: isOpen }),
  setContentCommonModal: (content) => set({ contentCommonModal: content }),
  setUniswapV3PoolETH_USDC: (contract) =>
    set({ uniswapV3PoolETH_USDC: contract }),
  setUniswapV3PoolUSDT_BTC: (contract) =>
    set({ uniswapV3PoolUSDT_BTC: contract }),
  setContractSigner: (contract) => set({ contractSigner: contract }),
  setUsdtSigner: (contract) => set({ usdtSigner: contract }),
  handleIsConnected: async (abiContract, abiUsdt, IUniswapV3PoolABI) => {
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
    } else {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const {
        poolAddress,
        poolAddressUSDT_BTC,
        addressContract,
        addressUSDTContract,
      } = get();
      const uniswapV3PoolETH_USDC = new ethers.Contract(
        poolAddress,
        IUniswapV3PoolABI,
        provider
      );
      const uniswapV3PoolUSDT_BTC = new ethers.Contract(
        poolAddressUSDT_BTC,
        IUniswapV3PoolABI,
        provider
      );
      const contractSigner = new ethers.Contract(
        addressContract,
        abiContract,
        signer
      );
      const usdtSigner = new ethers.Contract(
        addressUSDTContract,
        abiUsdt,
        signer
      );

      if (Number(network.chainId) !== 80001) {
        console.log("Wrong network. Need POL");
        // Обновите состояние, используя методы set
        set({
          isOpenCommonModal: true,
          contentCommonModal: "Wrong network. Please connect to Polygon!",
        });
      } else {
        // Обновите все соответствующие состояния
        set({
          account: accounts[0],
          provider,
          signer,
          network,
          isConnect: true,
          isOpenModalConnect: false,
          uniswapV3PoolETH_USDC,
          uniswapV3PoolUSDT_BTC,
          contractSigner,
          usdtSigner,
        });
      }
    }
  },
  handleConnectNotice: () => {
    set({
      isOpenCommonModal: true,
      contentCommonModal: "Please connect to MetaMask!",
    });
  },
}));
