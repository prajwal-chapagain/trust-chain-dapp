import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import logoImage from './logo.png';


function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [contract, setContract] = useState(null);

  const [deviceMetadata, setDeviceMetadata] = useState('');
  const [dataHash, setDataHash] = useState('');
  const [dataPrice, setDataPrice] = useState('');
  const [listingId, setListingId] = useState('');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";


  const contractABI = [
  "function registerDevice(string memory metadata) public",
  "function listData(string memory dataHash, uint price) public",
  "function buyData(uint listingId) public payable",
  "function listings(uint) public view returns (address buyer, address seller, uint amount, string memory shippingEvidence, string memory deliveryEvidence, uint status)"
];


  const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    // Request access to MetaMask accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create an ethers provider from the MetaMask injected provider
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Check if connected to Hardhat network (chainId: 31337)
    const network = await provider.getNetwork();
    if (network.chainId !== 31337n) {
      alert(`⚠️ Wrong network. Please switch MetaMask to Hardhat Localhost (chainId 31337). Current: ${network.chainId}`);
      return;
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setWalletAddress(address);

    const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(contractInstance);
    console.log("✅ Wallet connected:", address);
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    alert("❌ Failed to connect wallet.");
  }
};



  const registerDevice = async () => {
  if (!contract) {
    alert("❌ Wallet not connected or contract not set.");
    return;
  }

  if (!deviceMetadata) {
    alert("⚠️ Please enter device metadata.");
    return;
  }

  try {
    console.log("📡 Sending transaction with metadata:", deviceMetadata);
    const tx = await contract.registerDevice(deviceMetadata);
    console.log("⛓️ Transaction sent. Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction mined in block:", receipt.blockNumber);
    alert("✅ Device registered successfully!");
  } catch (error) {
    console.error("❌ Transaction failed:", error);
    alert("❌ Transaction failed. See console.");
  }
};



  const listData = async () => {
    if (!contract) return alert("Connect wallet first");
    const tx = await contract.listData(dataHash, ethers.parseEther(dataPrice));
    await tx.wait();
    alert("✅ Data listed for sale!");
  };

  const buyData = async () => {
    if (!contract) return alert("Connect wallet first");
    const listingIdInt = parseInt(listingId);

    const listing = await contract.listings(listingIdInt);
    const price = listing.price;

    const tx = await contract.buyData(listingIdInt, { value: price });
    await tx.wait();
    alert("✅ Data purchased successfully!");
  };

  return (
    <div className="container">
      <header className="app-header">
        <img src={logoImage} alt="Logo" className="logo-img" />
        <span className="brand-name">IoTChain</span>
      </header>

      <div className="App">
        <h1>IoT Data Marketplace DApp (Local Test-cprajwal4)</h1>

        {!walletAddress && <button onClick={connectWallet}>Connect Wallet</button>}
        {walletAddress && <p>Connected as: {walletAddress}</p>}

        <hr />

        <h2>Register IoT Device</h2>
        <input
          placeholder="Device Metadata"
          value={deviceMetadata}
          onChange={(e) => setDeviceMetadata(e.target.value)}
        />
        <button onClick={registerDevice}>Register Device</button>

        <hr />

        <h2>List Data for Sale</h2>
        <input
          placeholder="Data Hash or Description"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
        />
        <input
          placeholder="Price in ETH"
          value={dataPrice}
          onChange={(e) => setDataPrice(e.target.value)}
        />
        <button onClick={listData}>List Data</button>

        <hr />

        <h2>Buy Data</h2>
        <input
          placeholder="Listing ID"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
        />
        <button onClick={buyData}>Buy Data</button>
      </div>
    </div>
  );

}

export default App;
