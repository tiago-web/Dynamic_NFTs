import { network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { verify } from "../utils/verify";
import { storeImages, storeTokenUriMetadata } from "../utils/uploadToPinata";

const IMAGES_LOCATION = "./images/";

module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    let tokenUris: string[] = [
        "ipfs://QmQHkp3KPLczq82sQhWS5gQiK4ywcKALK956GUbNGExPcH",
        "ipfs://QmZYLVm2gfi68PnmdtFkkDcGkJBZPpkrRdS3mZqDjT2FU4",
        "ipfs://QmTBGwmPwUgNEHN6PQX5dN6Wx97bsf5X3RdqKVgZXyb5gN",
        "ipfs://QmV1SJTECRmZW9hkUnNe3geHgxMZEwAEeF7XKo6KkwcZtf",
        "ipfs://QmPT698D8QFYoraqhhfZsVCeq3EQS1irAKJWDqqMKEjYkd",
        "ipfs://QmaKzdBqACRYuQdEsaf2TgaU3gncuNXpGnJSasUf8Doov3",
    ];

    if (process.env.UPLOAD_TO_PINATA === "true") {
        tokenUris = await handleTokenUris();
    }

    log("----------------------------------------------------");
    const args = [tokenUris];
    const randomIpfsNft = await deploy("DigitalNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: (network.config as any).blockConfirmations || 1,
    });

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(randomIpfsNft.address, args);
    }
};

export interface MetadataProps {
    name: string;
    description: string;
    image: string;
}

const handleTokenUris = async () => {
    const tokenUris: string[] = [];
    const { responses: imageUploadResponses, files } = await storeImages(IMAGES_LOCATION);
    for (const imageUploadResponseIndex in imageUploadResponses) {
        const splittedFileName = files[imageUploadResponseIndex]
            .replace("-", " ")
            .replace(".jpg", "")
            .split("_");
        const tokenName = `${splittedFileName[1]} ${splittedFileName[2]}`;
        const tokenDescription = `An Adorable ${tokenName}!`;
        const tokenImage = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
        const tokenUriMetadata: MetadataProps = {
            name: tokenName,
            description: tokenDescription,
            image: tokenImage,
        };

        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata);

        if (metadataUploadResponse) {
            tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`);
        }
    }

    console.log({ tokenUris });

    return tokenUris;
};

module.exports.tags = ["all", "main", "digitalnft"];
