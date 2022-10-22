import { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

import NFTCard from "../../components/NFTCard";
import { toastError } from "../../utils/errorHandlers";

import "./styles.css";
import { useDigitalContract } from "../../hooks/useDigitalContract";
import { DogType } from "../../utils/helpers";
import { useAccount } from "../../contexts/AccountContext";
import ConnectWallet from "../../components/ConnectWallet";

export interface MetadataProps {
  image: string;
  description: string;
  name: string;
}

export interface NftsProps extends MetadataProps {
  tokenId: string;
  isEvolved: boolean;
  dogType?: DogType;
}

const MintNFT: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availableNfts, setAvailableNfts] = useState<NftsProps[]>([]);
  const { getAvailableMintTypes } = useDigitalContract();
  const { accountAddress } = useAccount();

  const loadAvailableNFTs = useCallback(async () => {
    setIsLoading(true);
    try {
      const availableMintTypes = await getAvailableMintTypes();
      setAvailableNfts(availableMintTypes);
    } catch (err) {
      toastError(err);
    }
    setIsLoading(false);
  }, [getAvailableMintTypes]);

  useEffect(() => {
    loadAvailableNFTs();
  }, [loadAvailableNFTs]);

  return (
    <>
      <h1 className="mint-nfts-title">Available NFTs to Mint</h1>

      {!accountAddress ? (
        <div className="connect-wallet-wrapper">
          <ConnectWallet />
        </div>
      ) : isLoading ? (
        <CircularProgress
          size="4rem"
          sx={{
            color: "#0081CC",
            position: "absolute",
            left: "45%",
            top: "50%",
          }}
        />
      ) : (
        <div className="nfts-container">
          {availableNfts.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} showMintBtn />
          ))}
        </div>
      )}
    </>
  );
};

export default MintNFT;
