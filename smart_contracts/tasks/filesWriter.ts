import fs from "fs";
import { DigitalNft } from "../typechain-types";
import { task } from "hardhat/config";

/**
 * Usage: yarn hardhat files-writer --network <neworkName>
 */
task("files-writer", "Writes abis and contract addresses to a file").setAction(
    async (taskArgs, hre) => {
        const networkId = hre.network.config.chainId;
        const digitalNft = (await hre.ethers.getContract("DigitalNft")) as DigitalNft;

        console.info(`digitalNftAddress:${digitalNft.address}`);

        // Writes the deployed address to address.ts
        console.info(`Addresses file...`);
        const configPath = `/../artifacts/config-${networkId}.ts`;

        fs.writeFileSync(
            __dirname + configPath,
            `
    export const digitalNftAddress = "${digitalNft.address}";
`
        );

        // Optimizes all the required abis
        const abiDir = `${__dirname}/../artifacts/abis`;
        if (!fs.existsSync(abiDir)) {
            fs.mkdirSync(abiDir);
        }

        const writeAbi = (abiName: string) => {
            console.info(`Writing ${abiName}`);
            let sourcePath = `${__dirname}/../artifacts/contracts/${abiName}.sol/${abiName}.json`;
            let sourceFile: any;
            try {
                sourceFile = fs.readFileSync(sourcePath, "utf8");
            } catch (err: any) {
                if (err.message.includes("no such file or directory")) {
                    try {
                        sourcePath = `${__dirname}/../artifacts/contracts/test/${abiName}.sol/${abiName}.json`;
                        sourceFile = fs.readFileSync(sourcePath, "utf8");
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
            const abi = JSON.parse(sourceFile).abi;

            const optimizedPath = `${__dirname}/../artifacts/abis/${abiName}.json`;
            fs.writeFileSync(optimizedPath, JSON.stringify(abi));
        };

        // ERC721 Token
        writeAbi("DigitalNft");
    }
);

export {};
