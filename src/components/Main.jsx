import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COIN_SIDES = ["Heads", "Tails"];

const Main = () => {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [selectedSide, setSelectedSide] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [coinResult, setCoinResult] = useState("");
  const [flipping, setFlipping] = useState(false);
  console.log(selectedSide);
  console.log(coinResult);

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        const newSigner = await provider.getSigner();
        setSigner(newSigner);

        const realBalance = await newSigner.getBalance();
        setBalance(ethers.formatEther(realBalance));
      } else {
        alert("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Error connecting to wallet", error);
    }
  };

  const handleBetAmount = (e) => {
    setBetAmount(e.target.value);
  };

  const selectSide = (side) => {
    setSelectedSide(side);
  };

  const flipCoin = async () => {
    if (!betAmount || !selectedSide || !signer) {
      toast.error("Please enter a bet amount and select a side.");
      return;
    }

    setFlipping(true);

    const randomIndex = Math.floor(Math.random() * 2);
    console.log(randomIndex);
    const result = COIN_SIDES[randomIndex];
    setCoinResult(result);

    const betValue = ethers.parseEther(betAmount);

    try {
      const tx = await signer.sendTransaction({
        to: account,
        value: betValue,
        gasLimit: 21000,
        gasPrice: ethers.parseUnits("20", "gwei"),
      });

      await tx.wait();

      if (result === selectedSide) {
        toast.success(
          `You won! The coin landed on ${result}. You've doubled your bet.`
        );
        const doubleBet = ethers.parseEther((betAmount * 2).toString());
        await signer.sendTransaction({
          to: account,
          value: doubleBet,
          gasLimit: 21000,
          gasPrice: ethers.parseUnits("20", "gwei"),
        });
      } else {
        toast.error(`You lost! The coin landed on ${result}.`);
      }

      setFlipping(false);
    } catch (error) {
      setFlipping(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  return (
    <div className="Main">
      <header className="Main-header">
        <h1>Coin Flip Game</h1>

        {!account && <button onClick={connectWallet}>Connect Wallet</button>}

        {account && (
          <>
            <p>Connected Account: {account}</p>
            <p>Balance: {balance} ETH</p>

            <div>
              <h2>Select a side:</h2>
              {COIN_SIDES.map((side) => (
                <button
                  key={side}
                  onClick={() => selectSide(side)}
                  className={selectedSide === side ? "selected" : ""}
                >
                  {side}
                </button>
              ))}
            </div>

            <div>
              <h2>Enter bet amount (ETH):</h2>
              <input
                type="number"
                value={betAmount}
                onChange={handleBetAmount}
                placeholder="Enter Bet Amount"
              />
            </div>
              
            <button onClick={flipCoin}>Flip Coin</button>

            <div className={`coin ${flipping ? "flipping" : ""}`}>
              <div className="side heads">Heads</div>
              <div className="side tails">Tails</div>
            </div>

            {coinResult && <p className="txt5">Coin landed on: {coinResult}</p>}
          </>
        )}
      </header>
      <ToastContainer />
    </div>
  );
};

export default Main;
