import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import { getDefaultNetworkName } from "./src/utils/crypto/getDefaultNetwork";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const config: HardhatUserConfig = {
  defaultNetwork: getDefaultNetworkName(),
  solidity: {
    version: "0.8.0",
  },
  networks: {
    kovan: {
      url: process.env.INFURA_KOVAN_RPC_URL,
      accounts: [
        `0x${process.env.DEPLOYER_PRIVATE_KEY}`,
        `0x${process.env.BACKEND_PRIVATE_KEY}`,
      ],
    },
  },
  paths: {
    sources: "src/contracts",
    tests: "src/tests/contracts",
  },
  typechain: {
    outDir: "typechain",
  },
  gasReporter: {
    currency: "USD",
  },
};

export default config;
