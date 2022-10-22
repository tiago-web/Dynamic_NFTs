import { useCallback } from "react";
import { BigNumber, ethers } from "ethers";

import { useAccount } from "../contexts/AccountContext";
import promiseWithTimeout from "../utils/promiseWithTimeout";

interface UseChainProps {
  watchNFTMinting: () => Promise<BigNumber | undefined>;
  watchEvolution: (tokenId: string) => Promise<void>;
}
const TOLERANCE_BLOCK_NUMBER = 5;

export const useChain = (): UseChainProps => {
  const { digitalNftContract, accountAddress } = useAccount();

  const watchNFTMinting = useCallback(async () => {
    if (!digitalNftContract) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const startBlockNumber =
      (await provider.getBlockNumber()) - TOLERANCE_BLOCK_NUMBER;

    let transactionHash = "";

    const eventWatcher = new Promise((resolve) => {
      digitalNftContract.on(
        "NFTMinted",
        (tokenId: BigNumber, requester, event) => {
          if (event.blockNumber <= startBlockNumber) return;

          transactionHash = event.transactionHash;

          if (requester === accountAddress) {
            resolve(tokenId);
          }
        }
      );
    });
    const tokenId = (await promiseWithTimeout(
      150000,
      eventWatcher,
      "Mint NFT timeout, please refresh the page to check if your NFT is already there!"
    )) as BigNumber | undefined;

    digitalNftContract.off(
      "NFTMinted",
      (tokenId: BigNumber, requester, event) => {
        if (event.blockNumber <= startBlockNumber) return;

        transactionHash = event.transactionHash;
      }
    );

    const transaction = await provider.getTransaction(transactionHash);
    await transaction.wait();

    return tokenId;
  }, [digitalNftContract, accountAddress]);

  const watchEvolution = useCallback(
    async (tokenId: string) => {
      if (!digitalNftContract) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const startBlockNumber =
        (await provider.getBlockNumber()) - TOLERANCE_BLOCK_NUMBER;

      let transactionHash = "";

      const eventWatcher = new Promise((resolve) => {
        digitalNftContract.on("NFTEvolved", (_tokenId, event) => {
          if (event.blockNumber <= startBlockNumber) return;

          transactionHash = event.transactionHash;

          if (_tokenId.toString() === tokenId) {
            resolve(_tokenId);
          }
        });
      });
      await promiseWithTimeout(
        150000,
        eventWatcher,
        "Evolve NFT timeout, please refresh the page to check if your NFT is already evolved!"
      );

      digitalNftContract.off("NFTEvolved", (_tokenId, event) => {
        if (event.blockNumber <= startBlockNumber) return;

        transactionHash = event.transactionHash;
      });

      const transaction = await provider.getTransaction(transactionHash);
      await transaction.wait();
    },
    [digitalNftContract]
  );

  return { watchNFTMinting, watchEvolution };
};
