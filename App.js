import React, { useState } from "react";
import axios from "axios";

function App() {
    const [document, setDocument] = useState(null);
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setDocument(e.target.files[0]);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!document || !password) {
            setMessage("Please select a file and enter a password.");
            return;
        }

        const formData = new FormData();
        formData.append("document", document);
        formData.append("password", password);

        try {
            const response = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(`Success! IPFS Hash: ${response.data.ipfsHash}`);
        } catch (error) {
            console.error(error);
            setMessage("Error uploading document.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Encrypted Document NFT System</h1>
            <p>
                This system uses advanced encryption (AES-256-CBC) for securing your documents
                before storing them on IPFS and blockchain.
            </p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Upload Document:</label>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div>
                    <label>Enter Password:</label>
                    <input type="password" value={password} onChange={handlePasswordChange} />
                </div>
                <button type="submit">Submit</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default App;
