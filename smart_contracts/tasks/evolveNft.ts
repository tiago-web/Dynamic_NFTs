import { task } from "hardhat/config";
import { MINT_PRICE } from "../utils/helper";
import { DigitalNft } from "../typechain-types";

/**
 * Usage: yarn hardhat evolve-nft --token-id <tokenId> --network <neworkName>
 */
task("evolve-nft", "Evolves a specific token")
    .addParam("tokenId", "Token id to be evolved")
    .setAction(async (taskArgs, hre) => {
        const digitalNft = (await hre.ethers.getContract("DigitalNft")) as DigitalNft;
        const tx = await digitalNft.evolve(taskArgs.tokenId, {
            value: hre.ethers.utils.parseEther(MINT_PRICE),
        });
        await tx.wait(1);

        console.log(
            `NFT Evolved successfully! tokenURI: ${await digitalNft.tokenURI(taskArgs.tokenId)}`
        );
    });

export {};
