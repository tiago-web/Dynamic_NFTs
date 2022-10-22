import { useCallback } from "react";
import { BigNumber } from "ethers";

import { useAccount } from "../contexts/AccountContext";
import { DogType, evolvePrice, mintPrice } from "../utils/helpers";
import { useChain } from "./useChain";
import axios from "axios";
import { MetadataProps, NftsProps } from "../pages/MintNFT";

interface UseDigitalContractProps {
  mintNft: (dogType: DogType) => Promise<BigNumber | undefined>;
  evolveNft: (tokenId: string) => Promise<void>;
  getAvailableMintTypes: () => Promise<NftsProps[]>;
  getMyNFTs: () => Promise<NftsProps[]>;
  getTokenMetadata: (tokenUri: string) => Promise<MetadataProps>;
}

export const useDigitalContract = (): UseDigitalContractProps => {
  const { digitalNftContract, accountAddress } = useAccount();
  const { watchEvolution, watchNFTMinting } = useChain();

  const mintNft = useCallback(
    async (dogType: DogType) => {
      const tx = await digitalNftContract?.mintNft(dogType, {
        value: mintPrice,
      });

      await tx?.wait();
      return watchNFTMinting();
    },
    [watchNFTMinting, digitalNftContract]
  );

  const evolveNft = useCallback(
    async (tokenId: string) => {
      const tx = await digitalNftContract?.evolve(tokenId, {
        value: evolvePrice,
      });

      await tx?.wait();
      await watchEvolution(tokenId);
    },
    [watchEvolution, digitalNftContract]
  );

  const getTokenMetadata = useCallback(
    async (tokenUri: string): Promise<MetadataProps> => {
      const requestURL = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const tokenURIResponse = await axios.get(requestURL);
      const imageURI = tokenURIResponse.data.image;
      const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");

      return {
        ...tokenURIResponse.data,
        image: imageURIURL,
      };
    },
    []
  );

  const getAvailableMintTypes = useCallback(async () => {
    const availableMintTypes: NftsProps[] = [];
    if (!digitalNftContract) return availableMintTypes;

    const AVAILABLE_MINT_TYPES_NUM = 3;

    for (let i = 0; i < AVAILABLE_MINT_TYPES_NUM; i++) {
      const tokenId = i;
      const dogTokenUri = await digitalNftContract.getDogTokenUri(tokenId);
      const parsedMetadata = await getTokenMetadata(dogTokenUri);

      // const requestURL = dogTokenUri.replace(
      //   "ipfs://",
      //   "https://ipfs.io/ipfs/"
      // );
      // const tokenURIResponse = await axios.get(requestURL);
      // const imageURI = tokenURIResponse.data.image;
      // const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");

      availableMintTypes.push({
        // ...tokenURIResponse.data,
        // image: imageURIURL,
        ...parsedMetadata,
        dogType: i,
        tokenId: String(tokenId),
        isEvolved: false,
      });
    }

    return availableMintTypes;
  }, [digitalNftContract, getTokenMetadata]);

  const getMyNFTs = useCallback(async () => {
    const myNFTs: NftsProps[] = [];
    if (!digitalNftContract) return myNFTs;
    const tokenCounter = (
      await digitalNftContract.getTokenCounter()
    ).toNumber();

    for (let i = 0; i < tokenCounter; i++) {
      const tokenId = i;

      const tokenOwner = await digitalNftContract.ownerOf(tokenId);

      if (tokenOwner === accountAddress) {
        const tokenURI = await digitalNftContract.tokenURI(tokenId);
        const parsedMetadata = await getTokenMetadata(tokenURI);

        // const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        // const tokenURIResponse = await axios.get(requestURL);
        // const imageURI = tokenURIResponse.data.image;
        // const imageURIURL = imageURI.replace(
        //   "ipfs://",
        //   "https://ipfs.io/ipfs/"
        // );

        const dog = await digitalNftContract.getDog(tokenId);

        myNFTs.push({
          // ...tokenURIResponse.data,
          // image: imageURIURL,
          ...parsedMetadata,
          tokenId: String(tokenId),
          isEvolved: dog.evolved,
        });
      }
    }

    return myNFTs;
  }, [digitalNftContract, accountAddress, getTokenMetadata]);

  return {
    mintNft,
    evolveNft,
    getAvailableMintTypes,
    getMyNFTs,
    getTokenMetadata,
  };
};
