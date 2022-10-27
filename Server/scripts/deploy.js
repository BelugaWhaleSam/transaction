const main = async () => {
  const Transactions = await hre.ethers.getContractFactory("Transactions"); // Create instances of contract
  const transactions = await Transactions.deploy(); // generate one specific instance of contract

  await transactions.deployed();
  console.log("Transactions deployed to:", transactions.address);
};

const runMain = async () => {
  try {
    await main(); // then calls this main function
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// When we deploy first this line is executed
runMain();
