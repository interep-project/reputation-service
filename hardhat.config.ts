import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@openzeppelin/hardhat-upgrades";

import "tsconfig-paths/register";
import { defaultNetworkByEnv } from "src/config";

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

const getNetworks = () => {
  if (process.env.NODE_ENV === "production") {
    const infuraApiKey = process.env.INFURA_API_KEY;
    if (!infuraApiKey) {
      throw new Error("Please set your INFURA_API_KEY in a .env file");
    }

    if (!process.env.BACKEND_PRIVATE_KEY) {
      throw new Error("Please set BACKEND_PRIVATE_KEY in a .env file");
    }
    const accounts = [`0x${process.env.BACKEND_PRIVATE_KEY}`];

    return {
      ropsten: {
        url: "https://ropsten.infura.io/v3/" + infuraApiKey,
        chainId: 3,
        accounts: accounts,
      },
      kovan: {
        url: "https://kovan.infura.io/v3/" + infuraApiKey,
        chainId: 42,
        accounts: accounts,
      },
    };
  }

  return undefined;
};

const config: HardhatUserConfig = {
  defaultNetwork: defaultNetworkByEnv[process.env.NODE_ENV]?.name || "hardhat",
  solidity: {
    version: "0.8.0",
  },
  networks: getNetworks(),
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
