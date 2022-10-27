import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

// Context is primarily used when some data needs to be accessible by
// many components at different nesting levels.
// It's like passing down the props to the children components
export const TransactionContext = React.createContext();

// By using metamask we get access to ethereum object
// We can use ethereum object to connect to our wallet
const { ethereum } = window;

// This is the function that will be called by our components to interact with the blockchain
// This function enables to fetch the ethereum contract
const getEthereumContract = () => {
  //Web3 provider allows your application to communicate with an Ethereum or Blockchain Node.
  const provider = new ethers.providers.Web3Provider(ethereum);
  // A Signer is a class which (usually) in some way directly or indirectly has access to a private key, which
  // can sign messages and transactions to authorize the network to charge your account ether to perform operations.
  const signer = provider.getSigner();
  // To fetch our contract and deploy contract and use smart contracts functions
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

// TransactionProvider is a component that will wrap around our entire application
// We'll use this in main to wrap all the components
// Then using TransactionContext.Provider we can pass any props to the children components
// The prop is passed using value prop
export const TransactionProvider = ({ children }) => {

  // To hold the transaction objects
  const [transaction, setTransaction] = useState([]);

  const [currentAccount, setCurrentAccount] = useState("");

  // For transaction, name should match the name in the input field
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  // useState for transactionCount
  // and we dont put 0, instead we grab the prev transactionCount from local storage
  // Since If it were to be 0 then everytime we'd refresh our site, the count would become 0
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );

  // useState loading used for the time being our transaction takes to go thru
  const [isLoading, setIsLoading] = useState(false);

  // handleChange is used to update the state of the form, or set the input values
  // This function is called by input in welcome.jsx with name parameter in it too
  // This function is assigned to onChange prop of input in welcome.jsx
  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  // returns all transactions in form of objects
  // just like dummy data
  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please connect to Metamask");

      const transactionContract = getEthereumContract();
      const availableTransactions = await transactionContract.getAllTransaction();
      // Since the transactions are in form of objects are in key format when we console log it
      // and we are taking this from the solidity contract thats used a structure
      // .sender, .receiver, .amount, .message, .keyword and .timestamp are the structure members in solidity
      // using map we mapped only the above values from availableTransactions to strucuredTransactions using transaction keyword in map
      const structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10 ** 18)
      }));

      setTransaction(structuredTransactions);

    } catch(error) {
      console.log(error);

      throw new Error("No ethereum wallet found");
    }
  }

  // To check if the user has metamask installed
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please connect to Metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);

      // If on initial mounting, the account is already conencted
      // we can set the cuurentAccount to the connected account
      // This can be further used to fetch the transactions and send as props in context
      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No account connected");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum wallet found");
    }
  };

  // this updates the number of transactions on local storage
  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum wallet found");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please connect to Metamask");
      // eth_requestAccounts is a method that will request the user to connect to their metamask wallet
      // Also It will return the list of accounts associated with the wallet
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      // We'll set the first account in the array as the connected account
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum wallet found");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please connect to Metamask");

      // we have accesss to form data variables using formData
      const { addressTo, amount, keyword, message } = formData;
      //call getEthereumContract function to get the contract
      const transactionContract = getEthereumContract();

      // To convert amount from decimal to hexadecimal
      // parseEther converts decimal to hexadecimal amount
      const parsedAmount = ethers.utils.parseEther(amount);

      // Transaction in metamask are initiated by calling eth_sendTransaction
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount, // Our address
            to: addressTo,
            gas: "0x5208", // 21000 Gwei
            value: parsedAmount._hex,
          },
        ],
      });

      // To store our transaction to blockchain
      // Calling our own function from solidity and that returns a transaction hash
      // This also charges some extra fee, 2nd time the metamask pop ups
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      // We use loading since it takes time as it is an await function
      // This is used to show a loading circle till the transaction is sent
      // It starts when the send button is pressed and ends when the transaction is sent
      setIsLoading(true);
      console.log(`Loading: ${transactionHash.hash}`);
      // This is going to wait for the transaction to be finished
      await transactionHash.wait();
      // After waiting the transaction is finished and we log success
      // the setLoading is false implies no loading is shown in welcome.jsx
      setIsLoading(false);
      console.log(`Success: ${transactionHash.hash}`);

      // To get the number of transaction
      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());

      // reload the page as soon as the transaction is done
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum wallet found");
    }
  };

  // We only call this function when the component is mounted, once
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    // Props is connectWallet function thats helps us to connect to the metamask wallet
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
        transaction,
        isLoading,
      }}
    >
      {children}{" "}
      {/*These children/components will have access to the value prop */}
    </TransactionContext.Provider>
  );
};
