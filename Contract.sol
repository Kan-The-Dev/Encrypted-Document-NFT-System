// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EncryptedDocumentNFT {
    mapping(uint256 => string) private documentURIs;
    mapping(uint256 => address) private documentOwners;

    uint256 private tokenCounter;

    event DocumentMinted(uint256 tokenId, address owner);

    constructor() {
        tokenCounter = 0;
    }

    function mintDocument(string memory encryptedURI) public returns (uint256) {
        uint256 newTokenId = tokenCounter;
        documentURIs[newTokenId] = encryptedURI;
        documentOwners[newTokenId] = msg.sender;

        tokenCounter++;
        emit DocumentMinted(newTokenId, msg.sender);
        return newTokenId;
    }

    function retrieveDocument(uint256 tokenId) public view returns (string memory) {
        require(documentOwners[tokenId] == msg.sender, "Not the owner");
        return documentURIs[tokenId];
    }

    function getOwner(uint256 tokenId) public view returns (address) {
        return documentOwners[tokenId];
    }
}
