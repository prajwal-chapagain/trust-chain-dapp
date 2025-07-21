import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [contract, setContract] = useState(null);

  const [deviceMetadata, setDeviceMetadata] = useState('');
  const [dataHash, setDataHash] = useState('');
  const [dataPrice, setDataPrice] = useState('');
  const [listingId, setListingId] = useState('');

  
  const contractAddress = "0x9D0C486c62D6d5A57367026F4af43B7Ffe12a8bd";
  const contractABI = [
    "function registerDevice(string memory metadata) public",
    "function listData(string memory dataHash, uint price) public",
    "function buyData(uint listingId) public payable"
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);
    } else {
      alert("Please install MetaMask");
    }
  };

  const registerDevice = async () => {
    if (!contract) return alert("Connect wallet first");
    const tx = await contract.registerDevice(deviceMetadata);
    await tx.wait();
    alert("Device registered!");
  };

  const listData = async () => {
    if (!contract) return alert("Connect wallet first");
    const tx = await contract.listData(dataHash, ethers.parseEther(dataPrice));
    await tx.wait();
    alert("Data listed for sale!");
  };

  const buyData = async () => {
    if (!contract) return alert("Connect wallet first");
    const listingIdInt = parseInt(listingId);
    const listing = await contract.listings(listingIdInt);
    const tx = await contract.buyData(listingIdInt, { value: listing.price });
    await tx.wait();
    alert("Data purchased successfully!");
  };

  return (
    <div className="App">
      <h1>IoT Data Marketplace DApp</h1>
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
  );
}

export default App;
