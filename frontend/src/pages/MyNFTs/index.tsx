import { useCallback, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

import NFTCard from "../../components/NFTCard";

import { toastError } from "../../utils/errorHandlers";

import { NftsProps } from "../MintNFT";
import { useDigitalContract } from "../../hooks/useDigitalContract";
import { useAccount } from "../../contexts/AccountContext";

import "./styles.css";
import ConnectWallet from "../../components/ConnectWallet";

const MyNFTs: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [myNfts, setMyNfts] = useState<NftsProps[]>([]);
  const navigate = useNavigate();
  const { getMyNFTs, getTokenMetadata } = useDigitalContract();
  const { digitalNftContract, accountAddress } = useAccount();

  const loadMyNFTs = useCallback(async () => {
    setIsLoading(true);
    try {
      const myTokens = await getMyNFTs();
      setMyNfts(myTokens);
    } catch (err) {
      toastError(err);
    }
    setIsLoading(false);
  }, [getMyNFTs]);

  useEffect(() => {
    loadMyNFTs();
  }, [loadMyNFTs]);

  const handleEvolvedNft = useCallback(
    async (tokenId: string) => {
      if (!digitalNftContract) return;
      setIsLoading(true);

      const tokenUri = await digitalNftContract.tokenURI(tokenId);
      const updatedMetadata = await getTokenMetadata(tokenUri);

      const evolvedTokenIndex = myNfts.findIndex(
        (nft) => nft.tokenId === tokenId
      );
      if (evolvedTokenIndex !== -1) {
        myNfts[evolvedTokenIndex] = {
          ...updatedMetadata,
          isEvolved: true,
          tokenId: myNfts[evolvedTokenIndex].tokenId,
        };
      }

      setMyNfts(myNfts);
      setIsLoading(false);
    },
    [digitalNftContract, getTokenMetadata, myNfts]
  );

  return (
    <>
      <h1 className="mynfts-title">My NFTs</h1>

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
        <>
          {myNfts.length > 0 ? (
            <div className="nfts-container">
              {myNfts.map((nft) => (
                <NFTCard
                  key={nft.tokenId}
                  showEvolveBtn={!nft.isEvolved}
                  updateEvolvedNft={handleEvolvedNft}
                  nft={nft}
                />
              ))}
            </div>
          ) : (
            <div className="no-nfts-container">
              <p>
                You don't have any NFTs in your account yet. Mint your first one
                first one to get started!
              </p>
              <button
                type="button"
                onClick={() => {
                  navigate("/mint-nft");
                }}
              >
                Mint NFT(s)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MyNFTs;
