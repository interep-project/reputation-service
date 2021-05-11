import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.0",
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
