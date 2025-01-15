const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { create } = require("ipfs-http-client");
const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const app = express();
const port = 5000;

// IPFS setup with error handling
let ipfs;
try {
    ipfs = create({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
} catch (error) {
    console.error("IPFS connection error:", error);
}

// Blockchain setup
const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_TESTNET_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
    "function mintDocument(string memory encryptedURI) public returns (uint256)"
];
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Multer for file upload with error handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Encrypt document using createCipheriv
function encryptDocument(buffer, password) {
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return encrypted;
}

// Routes
app.use(express.json());

app.post("/upload", upload.single("document"), async (req, res) => {
    try {
        const file = req.file;
        const password = req.body.password;

        if (!file || !password) {
            return res.status(400).json({ error: "File and password are required" });
        }

        // Encrypt the file
        const encryptedFile = encryptDocument(file.buffer, password);

        // Upload encrypted file to IPFS
        const result = await ipfs.add(encryptedFile);

        // Mint NFT with IPFS URI
        const tx = await contract.mintDocument(result.path);
        await tx.wait();

        res.json({ message: "Document uploaded and NFT minted", ipfsHash: result.path });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
