import { create } from "zustand";
import { ethers } from "ethers";
import ERC20abi from "../app/ERC20"; // TODO: move to common place

interface WalletState {
  isConnect: boolean;
  account: string;
  provider: ethers.BrowserProvider | any;
  signer: ethers.Signer | null;
  network: ethers.Network | null;
  isOpenCommonModal: boolean;
  contentCommonModal: string;
  isOpenModalConnect: boolean;
  positionManagerContractAddress: string;
  USDTContractAddress: string;
  ETHContractAddress: string;
  contractSigner: ethers.Contract | any;
  usdtSigner: ethers.Contract | any;
  ethSigner: ethers.Contract | any;
  positionManagerContractAbi: string;
  USDTContractAbi: string[];
  ETHContractAbi: string[];
  networks: any[];
  setIsOpenModalConnect: (isOpen: boolean) => void;
  setIsOpenCommonModal: (isOpen: boolean) => void;
  setContentCommonModal: (content: string) => void;
  setIsConnect: (isConnect: boolean) => void;
  setAccount: (account: string) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  setNetwork: (network: ethers.Network | null) => void;
  setContractSigner: (signer: ethers.Contract | any) => void;
  setUsdtSigner: (signer: ethers.Contract | any) => void;
  setEthSigner: (signer: ethers.Contract | any) => void;
  reinitializeContracts: () => void;
  handleIsConnected: () => void;
  handleConnectNotice: () => void;
  switchNetwork: (chainID: any) => void;
  disconnectWallet: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnect: false,
  account: "",
  provider: "",
  signer: null,
  network: null,
  isOpenCommonModal: false,
  contentCommonModal: "Error",
  contractSigner: "",
  usdtSigner: "",
  ethSigner: "",
  positionManagerContractAddress: process.env
    .NEXT_PUBLIC_POSITION_MANAGER_ADDRESS_MUMBAI!,
  USDTContractAddress: process.env.NEXT_PUBLIC_USDT_ERC20_ADDRESS_MUMBAI!,
  ETHContractAddress: process.env.NEXT_PUBLIC_ETH_ERC20_ADDRESS_MUMBAI!,
  positionManagerContractAbi: process.env.NEXT_PUBLIC_POSITION_MANAGER_ABI!,
  USDTContractAbi: ERC20abi,
  ETHContractAbi: ERC20abi,
  isOpenModalConnect: false,
  networks: [
    {
      name: "Polygon",
      chainId: "0x89",
    },
    {
      name: "Polygon Mumbai",
      chainId: "0x13881",
    },
  ],
  switchNetwork: async (chainId) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        get().reinitializeContracts();
      } else {
        console.log("MetaMask is not installed!");
      }
    } catch (error) {
      console.error("Failed to switch network", error);
    }
  },
  disconnectWallet: () => {
    set({
      isConnect: false,
      account: "",
      provider: null,
      signer: null,
      network: null,
    });
  },
  setIsOpenModalConnect: (isOpen) => set({ isOpenModalConnect: isOpen }),
  setIsConnect: (isConnect) => set(() => ({ isConnect })),
  setAccount: (account) => set(() => ({ account })),
  setProvider: (provider) => set(() => ({ provider })),
  setSigner: (signer) => set(() => ({ signer })),
  setNetwork: (network) => set(() => ({ network })),
  setIsOpenCommonModal: (isOpen) => set({ isOpenCommonModal: isOpen }),
  setContentCommonModal: (content) => set({ contentCommonModal: content }),
  setContractSigner: (contract) => set({ contractSigner: contract }),
  setUsdtSigner: (contract) => set({ usdtSigner: contract }),
  setEthSigner: (contract) => set({ ethSigner: contract }),
  reinitializeContracts: async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const {
        positionManagerContractAddress,
        USDTContractAddress,
        ETHContractAddress,
        positionManagerContractAbi,
        USDTContractAbi,
        ETHContractAbi,
      } = get();

      const newContractSigner = new ethers.Contract(
        positionManagerContractAddress,
        positionManagerContractAbi,
        signer
      );

      const newUsdtSigner = new ethers.Contract(
        USDTContractAddress,
        USDTContractAbi,
        signer
      );

      const newEthSigner = new ethers.Contract(
        ETHContractAddress,
        ETHContractAbi,
        signer
      );

      set({
        account: accounts[0],
        provider,
        signer,
        network,
        isConnect: true,
        isOpenModalConnect: false,
        contractSigner: newContractSigner,
        usdtSigner: newUsdtSigner,
        ethSigner: newEthSigner,
      });
    }
  },

  handleIsConnected: async () => {
    console.log("handleIsConnected");
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
    } else {
      await get().reinitializeContracts();
      const { network } = get();
      if (network) {
        if (Number(network.chainId) !== 80001) {
          console.log("Wrong network. Need POL");
          // Обновите состояние, используя методы set

          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [
                {
                  chainId: "0x13881",
                },
              ],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x13881",
                      chainName: "Mumbai",
                      rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
                      nativeCurrency: {
                        name: "MATIC",
                        symbol: "MATIC",
                        decimals: 18,
                      },
                      blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add the network", addError);
              } finally {
                await get().reinitializeContracts();
              }
            } else {
              // Обработка других ошибок
              console.error("Failed to switch the network", switchError);
            }
          } finally {
            await get().reinitializeContracts();
          }
        } else {
          await get().reinitializeContracts();
        }
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
