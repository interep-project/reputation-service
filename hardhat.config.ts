import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "solidity-coverage";

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
};

export default config;
