require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

const { PRIVATE_KEY, MUMBAI_RPC_URL } = process.env;

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.19" }]
  },
  networks: {
    hardhat: {},
    mumbai: {
      url: MUMBAI_RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    // if you want to verify contracts later; add API key to .env
    apiKey: process.env.POLYGONSCAN_API_KEY || ""
  }
};
