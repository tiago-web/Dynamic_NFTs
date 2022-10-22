import { task } from "hardhat/config";

import { DigitalNft } from "../typechain-types";
import { MINT_PRICE } from "../utils/helper";

/**
 * Usage: yarn hardhat mint-nft --dog-type <dogType> --network <neworkName>
 */
task("mint-nft", "Mint a Dog NFT")
    .addParam("dogType", "Dog type to mint")
    .setAction(async (taskArgs, hre) => {
        const digitalNft = (await hre.ethers.getContract("DigitalNft")) as DigitalNft;
        const tx = await digitalNft.mintNft(taskArgs.dogType, {
            value: hre.ethers.utils.parseEther(MINT_PRICE),
        });
        await tx.wait(1);

        const tokenId = (await digitalNft.getTokenCounter()).sub(1);
        console.log(`NFT Minted successfully! tokenURI: ${await digitalNft.tokenURI(tokenId)}`);
    });

export {};
