import "@nomiclabs/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import { resolve } from "path";
import "tsconfig-paths/register";
import { defaultNetworkByEnv } from "src/config";
import hardhatConfig from "./contracts/hardhat.config";

task("faucet", "Sends ETH to an address")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }, { ethers }) => {
    const [sender] = await ethers.getSigners();

    const tx2 = await sender.sendTransaction({
      to: receiver,
      value: ethers.constants.WeiPerEther,
    });
    await tx2.wait();

    console.log(`Transferred 1 ETH to ${receiver}`);
  });

dotenvConfig({ path: resolve(__dirname, "./.env") });

const config: HardhatUserConfig = {
  defaultNetwork: defaultNetworkByEnv[process.env.NODE_ENV]?.name || "hardhat",
  networks: hardhatConfig.networks,
  solidity: hardhatConfig.solidity,
  paths: {
    artifacts: "contracts/artifacts",
    sources: "contracts/contracts",
    tests: "contracts/test",
    cache: "contracts/cache",
  },
};

export default config;
