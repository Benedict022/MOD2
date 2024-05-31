import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showReceipt, setShowReceipt] = useState(false); // New state variable for showing receipt text
  const [randomSandwich, setRandomSandwich] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(100);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(100);
      await tx.wait();
      getBalance();
    }
  };

  const getAll = async () => {
    if (atm && balance !== undefined) {
      // Withdraw entire balance
      let tx = await atm.withdraw(balance);
      await tx.wait();
      getBalance();
    }
  };

  const randomizeSandwich = async () => {
    const SandwichList = [
      { name: "Double Cheese Burger", cost: 100 },
      { name: "Burger Mcdo", cost: 80 },
      { name: "Crispy Chicken Sandwich", cost: 90 },
      { name: "Quarter Pounder", cost: 70 },
      { name: "Cheese Burger", cost: 85 }
    ];

    const randomIndex = Math.floor(Math.random() * SandwichList.length);
    const selectedSandwich = SandwichList[randomIndex];

    if (atm) {
      let tx = await atm.withdraw(selectedSandwich.cost);
      await tx.wait();
      getBalance();
    }

    setRandomSandwich(selectedSandwich.name);
  };

  const exit = () => {
    setAccount(undefined);
    setATM(undefined);
    setBalance(undefined);
  };
  
  const printReceipt = () => {
    setShowReceipt(true);
    setTimeout(() => setShowReceipt(false), 3000); // Hide the receipt text after 3 seconds
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>Please connect your Metamask wallet</button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit 100 ETH</button>
        <button onClick={withdraw}>Withdraw 100 ETH</button>
        <button style={{backgroundColor: '#008CBA' }} onClick={getAll}>Get all the Token</button>
        <button style={{backgroundColor: '#357cf0' }} onClick={randomizeSandwich}>Randomize Sandwich</button>
            <p style={{ fontSize: '1.2rem' }}>Random Sandwich: {randomSandwich}</p>
        <button style={{backgroundColor: '#0af024'}} onClick={printReceipt}>Print Receipt</button> {/* New button */}
        {showReceipt && <p>Printing receipt</p>} {/* Conditional rendering of the receipt text */}
        <button style={{ backgroundColor: '#f0d10a' }} onClick={exit}>Refresh</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <div className="outer-wrapper">
    <div className="container">
      <header>
        <h1>Welcome to the BurgerMcdo ATM!</h1>
      </header>
      
      {initUser()}
    </div>
    <style jsx>{`
      .outer-wrapper {
        background-color: #ffff38;
        padding: 20px; 
        border: 2px solid #ccc; 
        border-radius: 8px; 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
        max-width: 600px; 
        margin: 0 auto; 
      }
      .container {
        text-align: center;
        background-color: #ff4c38; 
        padding: 20px;
        border-radius: 8px;
      }
      header {
        margin-bottom: 20px;
      }
      button {
        margin: 5px;
        padding: 10px 20px;
        font-size: 16px;
      }
      p {
        font-size: 18px;
      }
    `}</style>
  </div>
);
}
