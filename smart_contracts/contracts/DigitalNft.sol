// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice The contract has already being initialized.
 */
error DigitalNft__AlreadyInitialized();
/**
 * @notice The specified type cannot be minted.
 */
error DigitalNft__InvalidMintType();
/**
 * @notice The amount of ETH sent is not enough.
 */
error DigitalNft__InsufficientETHSent();
/**
 * @notice The specified token id is invalid.
 */
error DigitalNft__InvalidTokenId();
/**
 * @notice The specified token has already being evolved.
 */
error DigitalNft__NftAlreadyEvolved();

/**
 * @title Digital Nft contract
 * @author <contact@tiagosoriano.dev>
 * @notice Enables accounts to mint and evolve ERC-721 dog tokens
 */
contract DigitalNft is ERC721URIStorage, Ownable {
    enum DogType {
        BABY_PUG,
        BABY_SHIBA_INU,
        BABY_ST_BERNARD,
        ADULT_PUG,
        ADULT_SHIBA_INU,
        ADULT_ST_BERNARD
    }

    struct Dog {
        bool evolved;
        DogType dogType;
    }

    uint256 private constant MINT_PRICE = 0.001 ether;
    uint256 private constant EVOLVE_PRICE = 0.0005 ether;

    uint256 private _tokenCounter = 0;
    string[6] internal _dogTokenUris;
    bool private _initialized;

    mapping(uint256 => Dog) private _dogs;

    event NFTMinted(uint256 indexed tokenId, address requester);
    event NFTEvolved(uint256 indexed tokenId);

    constructor(string[6] memory dogTokenUris) ERC721("Digital", "DGT") {
        _initializeContract(dogTokenUris);
    }

    function _initializeContract(string[6] memory dogTokenUris) private {
        if (_initialized) {
            revert DigitalNft__AlreadyInitialized();
        }
        _dogTokenUris = dogTokenUris;
        _initialized = true;
    }

    /**
     * @notice Mints a token a baby dog (ERC-721) token.
     * This transaction costs `MINT_PRICE` ETH
     * @param dogType type of the nft to be minted.
     */
    function mintNft(DogType dogType) external payable {
        if (msg.value < MINT_PRICE) revert DigitalNft__InsufficientETHSent();
        if (
            !(dogType == DogType.BABY_PUG ||
                dogType == DogType.BABY_SHIBA_INU ||
                dogType == DogType.BABY_ST_BERNARD)
        ) revert DigitalNft__InvalidMintType();

        _safeMint(msg.sender, _tokenCounter);
        _setTokenURI(_tokenCounter, _dogTokenUris[uint256(dogType)]);

        Dog storage dog = _dogs[_tokenCounter];

        dog.evolved = false;
        dog.dogType = dogType;

        emit NFTMinted(_tokenCounter, msg.sender);

        _tokenCounter = _tokenCounter + 1;
    }

    /**
     * @notice Evolves a token to its next level.
     * Calling account must have a valid and unevolved minted ERC-721 token.
     * This transaction costs `EVOLVE_PRICE` ETH
     * @param tokenId Id of the nft to evolve.
     */
    function evolve(uint256 tokenId) external payable {
        if (msg.value < EVOLVE_PRICE) revert DigitalNft__InsufficientETHSent();
        if (tokenId >= _tokenCounter) revert DigitalNft__InvalidTokenId();

        Dog storage dog = _dogs[tokenId];

        // Nfts should not be able to evolve more than once
        if (dog.evolved) revert DigitalNft__NftAlreadyEvolved();

        DogType newType = _findEvolution(dog.dogType);

        _setTokenURI(tokenId, _dogTokenUris[uint256(newType)]);

        dog.evolved = true;
        dog.dogType = newType;

        emit NFTEvolved(tokenId);
    }

    function _findEvolution(DogType dogType) internal pure returns (DogType) {
        if (dogType == DogType.BABY_PUG) {
            return DogType.ADULT_PUG;
        } else if (dogType == DogType.BABY_SHIBA_INU) {
            return DogType.ADULT_SHIBA_INU;
        } else {
            return DogType.ADULT_ST_BERNARD;
        }
    }

    function getMintPrice() external pure returns (uint256) {
        return MINT_PRICE;
    }

    function getEvolvePrice() external pure returns (uint256) {
        return EVOLVE_PRICE;
    }

    function getTokenCounter() public view returns (uint256) {
        return _tokenCounter;
    }

    function getDogTokenUri(DogType dogType) public view returns (string memory) {
        return _dogTokenUris[uint256(dogType)];
    }

    function getDog(uint256 tokenId) public view returns (Dog memory) {
        return _dogs[tokenId];
    }
}
