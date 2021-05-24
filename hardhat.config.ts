import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import { getDefaultNetworkName } from "./src/utils/crypto/getDefaultNetwork";

import "tsconfig-paths/register";

task("faucet", "Sends ETH to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }) => {
    // @ts-ignore: hre is defined inside a task
    const [sender] = await hre.ethers.getSigners();

    const tx2 = await sender.sendTransaction({
      to: receiver,
      // @ts-ignore: hre is defined inside a task
      value: hre.ethers.constants.WeiPerEther,
    });
    await tx2.wait();

    console.log(`Transferred 1 ETH to ${receiver}`);
  });

dotenvConfig({ path: resolve(__dirname, "./.env") });

const backendPrivateKey = process.env.BACKEND_PRIVATE_KEY
  ? `0x${process.env.BACKEND_PRIVATE_KEY}`
  : "";
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY
  ? `0x${process.env.DEPLOYER_PRIVATE_KEY}`
  : "";

const config: HardhatUserConfig = {
  defaultNetwork: getDefaultNetworkName(),
  solidity: {
    version: "0.8.0",
  },
  networks: {
    kovan: {
      url: process.env.INFURA_KOVAN_RPC_URL,
      accounts: [backendPrivateKey, deployerPrivateKey],
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
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
