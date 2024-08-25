import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import head from "../images/head.png";
import tail from "../images/tail.png";
const COIN_SIDES = ["Heads", "Tails"];

const Home = () => {
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [selectedSide, setSelectedSide] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [balance, setBalance] = useState("0.00");
  const [coinResult, setCoinResult] = useState("");
  const [flipping, setFlipping] = useState(false);
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        toast.success("Connected Sucessfully");

        const newSigner = await provider.getSigner();
        setSigner(newSigner);

        const realBalance = await newSigner.getBalance();
        setBalance(ethers.formatEther(realBalance));
      } else {
        toast.error("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Error connecting to wallet", error);
    }
  };

  const handleBetAmount = (e) => {
    setBetAmount(e.target.value);
  };

  const flipCoin = async () => {
    if (!betAmount || !selectedSide || !signer) {
      toast.error("Please enter a bet amount and select a side.");
      return;
    }

    setFlipping(true);

    const randomIndex = Math.floor(Math.random() * 2);
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
      console.error("Error during coin flip:", error);
      toast.error("Transaction failed!");
      setFlipping(false);
      setCoinResult("");
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
    <>
      <ToastContainer />
      <div className="benton-grid">
        <div className="item">
          <p>
            Connected Account:
            <br />
            <div className="txt3"> {account}</div>
          </p>
        </div>
        <div className="item">
          <button onClick={connectWallet}>
            {!account ? <>Connect Account</> : <>Connected</>}
          </button>
          Balance in ETH: <div className="txt1">{balance} ETH</div>
        </div>
        <div className="item">
          <div className={`coin ${flipping ? "flipping" : ""}`}>
            {coinResult == "" ? (
              <div className="side heads">
                <img src={head} alt="Heads" />
              </div>
            ) : coinResult == "Heads" ? (
              <div className="side heads">
                <img src={head} alt="Heads" />
              </div>
            ) : (
              <div className="side tails">
                <img src={tail} alt="Tails" />
              </div>
            )}
          </div>
        </div>
        <div className="item">
          <div>
            <h2>Select a side:</h2>
            {COIN_SIDES.map((side) => (
              <button
                key={side}
                onClick={() => setSelectedSide(side)}
                className={selectedSide === side ? "selected" : ""}
              >
                {side}
              </button>
            ))}
          </div>
        </div>
        <div className="item">
          <button className="txt1" onClick={flipCoin}>
            Flip Coin
          </button>
        </div>
        <div className="item">
          <h2>GUIDE</h2>
          <div className="txt5">
            🔗 Connect your wallet <br />
            🪙 Pick Heads or Tails <br />
            💰 Enter your bet <br />
            🎯 Flip & carry out the transaction
          </div>
        </div>
        <div className="item">
          Bet Amount in ETH:
          <input
            className="txt2"
            type="number"
            value={betAmount}
            onChange={handleBetAmount}
          />
        </div>
        <div className="item">
          <div className="txt3">
            <p>Coin landed on: {coinResult}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
