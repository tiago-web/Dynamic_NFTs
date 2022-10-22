import { ethers } from "ethers";
import {
  useCallback,
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAccount } from "./AccountContext";

interface ContractParamsContextData {
  mintPrice: string;
  evolvePrice: string;
  tokenCounter: string;
}

const ContractParamsContext = createContext<ContractParamsContextData>(
  {} as ContractParamsContextData
);

interface ContractParamsProviderProps {
  children: React.ReactNode;
}

const ContractParamsProvider: React.FC<ContractParamsProviderProps> = ({
  children,
}) => {
  const [mintPrice, setMintPrice] = useState("0");
  const [evolvePrice, setEvolvePrice] = useState("0");
  const [tokenCounter, setTokenCounter] = useState("0");
  const { digitalNftContract } = useAccount();

  const getMintPrice = useCallback(async () => {
    return digitalNftContract?.getMintPrice();
  }, [digitalNftContract]);

  const getEvolvePrice = useCallback(async () => {
    return digitalNftContract?.getEvolvePrice();
  }, [digitalNftContract]);

  const getTokenCounter = useCallback(async () => {
    return digitalNftContract?.getTokenCounter();
  }, [digitalNftContract]);

  useEffect(() => {
    const loadParams = async () => {
      const _mintPrice = await getMintPrice();
      const _evolvePrice = await getEvolvePrice();
      const _tokenCounter = await getTokenCounter();

      if (_mintPrice) {
        const formattedMintPrice = ethers.utils.formatEther(_mintPrice);
        setMintPrice(formattedMintPrice);
      }
      if (_evolvePrice) {
        const formattedMintPrice = ethers.utils.formatEther(_evolvePrice);
        setEvolvePrice(formattedMintPrice);
      }
      if (_tokenCounter) {
        const formattedMintPrice = ethers.utils.formatEther(_tokenCounter);
        setTokenCounter(formattedMintPrice);
      }
    };
    loadParams();
  }, [getMintPrice, getEvolvePrice, getTokenCounter]);

  const contextValue = useMemo(
    () => ({
      mintPrice,
      evolvePrice,
      tokenCounter,
    }),
    [mintPrice, evolvePrice, tokenCounter]
  );

  return (
    <ContractParamsContext.Provider value={contextValue}>
      {children}
    </ContractParamsContext.Provider>
  );
};

export const useContractParams = (): ContractParamsContextData => {
  const context = useContext(ContractParamsContext);

  return context;
};

export default ContractParamsProvider;
