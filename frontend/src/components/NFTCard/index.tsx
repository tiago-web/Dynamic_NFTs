import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useState, useCallback } from "react";
import { useAccount } from "../../contexts/AccountContext";
import { useContractParams } from "../../contexts/ContractParamsContext";
import { useDigitalContract } from "../../hooks/useDigitalContract";
import { NftsProps } from "../../pages/MintNFT";
import { toastError, toastSuccess } from "../../utils/errorHandlers";

import "./styles.css";

interface NFTCardProps {
  nft: NftsProps;
  showMintBtn?: boolean;
  showEvolveBtn?: boolean;
  updateEvolvedNft?: (tokenId: string) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  showEvolveBtn = false,
  showMintBtn = false,
  updateEvolvedNft = () => {},
}) => {
  const [displayEvolveBtn, setDisplayEvolveBtn] = useState(showEvolveBtn);
  const [isMinting, setIsMinting] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);

  const { mintNft, evolveNft } = useDigitalContract();
  const { mintPrice, evolvePrice } = useContractParams();
  const { accountAddress, digitalNftContract } = useAccount();

  const handleMintNft = useCallback(async () => {
    setIsMinting(true);

    try {
      if (nft.dogType === undefined) {
        throw new Error("Invalid dog type");
      }

      const tokenId = await mintNft(nft.dogType);

      if (tokenId && digitalNftContract) {
        const tokenUri = await digitalNftContract.tokenURI(tokenId.toString());

        const requestURL = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const tokenURIResponse = await axios.get(requestURL);

        toastSuccess(
          `User ${accountAddress} has just minted ${tokenURIResponse.data.name}!`
        );
      }
    } catch (error) {
      toastError(error);
    }

    setIsMinting(false);
  }, [accountAddress, mintNft, nft.dogType]);

  const handleEvolveNft = useCallback(async () => {
    setIsEvolving(true);
    try {
      await evolveNft(nft.tokenId);
      updateEvolvedNft(nft.tokenId);
      toastSuccess(`User ${accountAddress} has just evolved ${nft.name}!`);
      setDisplayEvolveBtn(false);
    } catch (error) {
      toastError(error);
    }
    setIsEvolving(false);
  }, [accountAddress, nft.tokenId, evolveNft, updateEvolvedNft]);

  return (
    <div className="nft-card">
      <div className="img-hover-zoom">
        <img alt={nft.name} src={nft.image} />
      </div>
      <div className="nft-card-info">
        <p className="nft-name">{nft.name}</p>
        <p className="nft-description">{nft.description}</p>

        {showMintBtn && (
          <button onClick={handleMintNft}>
            {isMinting ? (
              <CircularProgress
                size="1.5rem"
                sx={{
                  color: "#fff",
                }}
              />
            ) : (
              `Mint NFT (${mintPrice} ETH)`
            )}
          </button>
        )}

        {displayEvolveBtn && (
          <button onClick={handleEvolveNft}>
            {isEvolving ? (
              <CircularProgress
                size="1.5rem"
                sx={{
                  color: "#fff",
                }}
              />
            ) : (
              `Evolve NFT (${evolvePrice} ETH)`
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default NFTCard;
