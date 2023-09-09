import { ethers, providers } from "./ethers-5.2-esm-min.js";
import { abi, contractAddress } from "./constants.js";

const connectbtn = document.getElementById("connectbtn");
const fundbtn = document.getElementById("fundbtn");
const getbalance = document.getElementById("getBalance");
const Withdraw = document.getElementById("withdraw");
connectbtn.addEventListener("click", connect);
fundbtn.addEventListener("click", fund);
getbalance.onclick = getBalance;
Withdraw.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await ethereum.request({ method: "eth_requestAccounts" });
    connectbtn.innerHTML = "Connected";
  } else {
    connectbtn.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const FormattedBalance = await provider.getBalance(contractAddress);
    const Balance = ethers.utils.formatEther(FormattedBalance);
    document.getElementById(
      "balanceAmount"
    ).innerHTML = `<p>Your account balance is ${Balance} ETH`;
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      getBalance();
    } catch (error) {
      console.log(error);
    }
  }
}

async function fund(ethAmount) {
  const userInput = document.getElementById("fundinputid").value;
  // console.log(typeof userInput, userInput);
  ethAmount = userInput;
  console.log("Funding with amount " + ethAmount);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    // console.log(contract);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done..");
    } catch (error) {
      console.log(error);
    }
  }
}

const listenForTransactionMine = (transactionResponse, provider) => {
  console.log(`Mining ${transactionResponse.hash}.....`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Transaction ${transactionReceipt.confirmations} confirmations..`
      );
      resolve();
    });
  });
};
