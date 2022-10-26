import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { deployments, ethers, waffle } from "hardhat";
import { DigitalNft } from "../typechain-types";
import { DogType, MINT_PRICE, EVOLVE_PRICE } from "../utils/helper";

describe("Digital NFT Unit Tests", () => {
    let digitalNft: DigitalNft;
    let deployer: SignerWithAddress;
    let alice: SignerWithAddress;
    const provider = waffle.provider;
    const mintPrice = ethers.utils.parseEther(MINT_PRICE);
    const evolvePrice = ethers.utils.parseEther(EVOLVE_PRICE);

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        alice = accounts[1];

        await deployments.fixture(["digitalnft"]);
        digitalNft = await ethers.getContract("DigitalNft");
    });

    describe("construtor", () => {
        it("initializes the DigitalNft contract correctly.", async () => {
            const name = await digitalNft.name();
            const symbol = await digitalNft.symbol();
            const tokenCounter = await digitalNft.getTokenCounter();
            const dogType0Uri = await digitalNft.getDogTokenUri(DogType.BABY_PUG);
            const dogType2Uri = await digitalNft.getDogTokenUri(DogType.BABY_ST_BERNARD);
            const dogType4Uri = await digitalNft.getDogTokenUri(DogType.ADULT_SHIBA_INU);
            assert.equal(name, "Digital");
            assert.equal(symbol, "DGT");
            assert.equal(tokenCounter.toString(), "0");
            assert.equal(dogType0Uri, "ipfs://QmQHkp3KPLczq82sQhWS5gQiK4ywcKALK956GUbNGExPcH");
            assert.equal(dogType2Uri, "ipfs://QmTBGwmPwUgNEHN6PQX5dN6Wx97bsf5X3RdqKVgZXyb5gN");
            assert.equal(dogType4Uri, "ipfs://QmPT698D8QFYoraqhhfZsVCeq3EQS1irAKJWDqqMKEjYkd");
        });
    });

    describe("mintNft", () => {
        beforeEach(async () => {
            const tx = await digitalNft.mintNft(DogType.BABY_SHIBA_INU, {
                value: mintPrice,
            });

            await tx.wait(1);
        });

        it("allows users to mint an NFT, and updates appropriately", async () => {
            const tokenURI = await digitalNft.tokenURI("0");
            const tokenCounter = await digitalNft.getTokenCounter();

            assert.equal(tokenCounter.toString(), "1");
            assert.equal(tokenURI, "ipfs://QmZYLVm2gfi68PnmdtFkkDcGkJBZPpkrRdS3mZqDjT2FU4");
        });

        it("decreases the user balance after mint", async () => {
            const initialBalance = await provider.getBalance(alice.address);

            const tx = await digitalNft.connect(alice).mintNft(DogType.BABY_SHIBA_INU, {
                value: mintPrice,
                gasLimit: 1000000,
                gasPrice: ethers.utils.parseUnits("1", "gwei"),
            });

            const receipt = await tx.wait(1);
            const gasUsed = ethers.utils.parseUnits(receipt.gasUsed.toString(), "gwei").toString();

            const balanceAfterMint = await provider.getBalance(alice.address);
            const balanceAfterMintTarget = initialBalance.sub(gasUsed).sub(mintPrice);

            assert.equal(balanceAfterMint.toString(), balanceAfterMintTarget.toString());
        });

        it("show the correct balance and owner of an NFT", async () => {
            const deployerAddress = deployer.address;
            const deployerBalance = await digitalNft.balanceOf(deployer.address);
            const owner = await digitalNft.ownerOf("0");

            assert.equal(deployerBalance.toString(), "1");
            assert.equal(owner, deployerAddress);
        });

        it("should emit NFTMinted event successfully", async () => {
            await expect(
                digitalNft.connect(alice).mintNft(DogType.BABY_SHIBA_INU, {
                    value: mintPrice,
                })
            )
                .to.emit(digitalNft, "NFTMinted")
                .withArgs("1", alice.address);
        });

        it("should fail if the nft type is invalid", async () => {
            await expect(
                digitalNft.mintNft(DogType.ADULT_PUG, {
                    value: mintPrice,
                })
            ).to.be.revertedWith("DigitalNft__InvalidMintType()");
        });

        it("should fail if the eth sent is not enough", async () => {
            await expect(
                digitalNft.mintNft("1", {
                    value: ethers.utils.parseEther("0"),
                })
            ).to.be.revertedWith("DigitalNft__InsufficientETHSent()");
        });
    });

    describe("evolve", () => {
        beforeEach(async () => {
            let tx = await digitalNft.mintNft(DogType.BABY_PUG, {
                value: mintPrice,
            });
            await tx.wait(1);

            tx = await digitalNft.evolve("0", {
                value: evolvePrice,
            });
            await tx.wait(1);
        });

        it("evolves the token appropriately", async () => {
            const tokenURI = await digitalNft.tokenURI("0");
            assert.equal(tokenURI, "ipfs://QmV1SJTECRmZW9hkUnNe3geHgxMZEwAEeF7XKo6KkwcZtf");
        });

        it("decreases the user balance after evolve", async () => {
            const initialBalance = await provider.getBalance(alice.address);

            let tx = await digitalNft.connect(alice).mintNft(DogType.BABY_SHIBA_INU, {
                value: mintPrice,
                gasLimit: 1000000,
                gasPrice: ethers.utils.parseUnits("1", "gwei"),
            });
            let receipt = await tx.wait(1);
            let gasUsed = ethers.utils.parseUnits(receipt.gasUsed.toString(), "gwei").toString();
            const balanceBeforeEvo = await provider.getBalance(alice.address);
            const balanceBeforeTarget = initialBalance.sub(gasUsed).sub(mintPrice);

            assert.equal(balanceBeforeEvo.toString(), balanceBeforeTarget.toString());

            tx = await digitalNft.connect(alice).evolve("1", {
                value: evolvePrice,
                gasLimit: 1000000,
                gasPrice: ethers.utils.parseUnits("1", "gwei"),
            });
            receipt = await tx.wait(1);
            gasUsed = ethers.utils.parseUnits(receipt.gasUsed.toString(), "gwei").toString();

            const balanceAfterEvo = await provider.getBalance(alice.address);
            const balanceAfterTarget = balanceBeforeEvo.sub(gasUsed).sub(evolvePrice);

            assert.equal(balanceAfterEvo.toString(), balanceAfterTarget.toString());
        });

        it("should emit NFTEvolved event successfully", async () => {
            const tx = await digitalNft.mintNft(DogType.BABY_PUG, {
                value: mintPrice,
            });
            await tx.wait(1);

            await expect(
                digitalNft.evolve("1", {
                    value: evolvePrice,
                })
            )
                .to.emit(digitalNft, "NFTEvolved")
                .withArgs("1");
        });

        it("should fail if the invalid owner tries to evolve", async () => {
            const tx = await digitalNft.mintNft(DogType.BABY_PUG, {
                value: mintPrice,
            });
            await tx.wait(1);

            await expect(
                digitalNft.connect(alice).evolve("1", {
                    value: evolvePrice,
                })
            ).to.be.revertedWith("DigitalNft__InvalidOwner()");
        });

        it("should fail if the eth sent is not enough", async () => {
            await expect(
                digitalNft.evolve("0", {
                    value: ethers.utils.parseEther("0"),
                })
            ).to.be.revertedWith("DigitalNft__InsufficientETHSent()");
        });

        it("should fail if the token id is not found", async () => {
            await expect(
                digitalNft.evolve("1", {
                    value: evolvePrice,
                })
            ).to.be.revertedWith("DigitalNft__InvalidTokenId()");
        });

        it("does not allow to evolve more than once", async () => {
            await expect(
                digitalNft.evolve("0", {
                    value: evolvePrice,
                })
            ).to.be.revertedWith("DigitalNft__NftAlreadyEvolved()");
        });
    });
});
