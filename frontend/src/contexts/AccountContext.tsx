import {
  useCallback,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";

import {
  digitalNftAbi,
  digitalNftAddress,
  blockchainParams,
} from "../chain/config";
import { DigitalNft } from "../chain/typechain-types";
import { toastError } from "../utils/errorHandlers";

interface AccountContextData {
  provider?: Web3Provider;
  digitalNftContract?: DigitalNft;
  accountAddress?: string;
  signer?: ethers.providers.JsonRpcSigner;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AccountContext = createContext<AccountContextData>(
  {} as AccountContextData
);

interface AccountProviderProps {
  children: React.ReactNode;
}

const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<Web3Provider | undefined>();
  const [digitalNftContract, setDigitalNftContract] = useState<
    DigitalNft | undefined
  >();
  const [accountAddress, setAccountAddress] = useState<string | undefined>();
  const [signer, setSigner] = useState<
    ethers.providers.JsonRpcSigner | undefined
  >();

  const connectAddress = useCallback(
    (signer: ethers.providers.JsonRpcSigner) => {
      const digitalNft = new ethers.Contract(
        digitalNftAddress,
        digitalNftAbi,
        signer
      ) as DigitalNft;

      setDigitalNftContract(digitalNft);
    },
    []
  );

  const connectToWallet = useCallback(async () => {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await web3Provider.send("eth_requestAccounts", []);

    const signer = web3Provider.getSigner();
    const address = await signer?.getAddress();

    connectAddress(signer);

    setProvider(web3Provider);
    setSigner(signer);
    setAccountAddress(address);
    localStorage.setItem("isWalletConnected", "true");
  }, [connectAddress]);

  const requestChangeNetworkAndConnect = useCallback(async () => {
    if (!window?.ethereum) {
      toastError("Metamask is not installed, please install!");
    }
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const { chainId } = await web3Provider.getNetwork();

    if (blockchainParams.chainId) {
      if (chainId !== parseInt(blockchainParams.chainId, 16)) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: blockchainParams.chainId }],
          });

          await connectToWallet();
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError?.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [blockchainParams],
              });
              await connectToWallet();
            } catch (addError) {
              toastError(addError);
              localStorage.setItem("isWalletConnected", "false");
            }
          } else if (switchError?.code === 4001) {
            toastError(
              "To connect your wallet you must switch to the right network!"
            );
            localStorage.setItem("isWalletConnected", "false");
          }
        }
      } else {
        connectToWallet();
      }
    }
  }, [connectToWallet]);

  const connectWallet = useCallback(async () => {
    try {
      await requestChangeNetworkAndConnect();
    } catch (err) {
      toastError(err);
    }
  }, [requestChangeNetworkAndConnect]);

  const disconnectWallet = useCallback(() => {
    setAccountAddress(undefined);
    localStorage.setItem("isWalletConnected", "false");
  }, []);

  useEffect(() => {
    if (localStorage?.getItem("isWalletConnected") === "true") {
      requestChangeNetworkAndConnect();
    }
  }, [requestChangeNetworkAndConnect]);

  const contextValue = useMemo(
    () => ({
      provider,
      digitalNftContract,
      accountAddress,
      signer,
      connectWallet,
      disconnectWallet,
    }),
    [
      provider,
      digitalNftContract,
      connectWallet,
      accountAddress,
      signer,
      disconnectWallet,
    ]
  );

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = (): AccountContextData => {
  const context = useContext(AccountContext);

  return context;
};

export default AccountProvider;
