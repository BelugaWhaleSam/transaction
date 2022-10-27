require("@nomicfoundation/hardhat-toolbox");
// plugin to build smart contract tests
require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
  },
};

// 0x73975c6516CD4F6A04D961664D890cfC1606D7F7: contract address