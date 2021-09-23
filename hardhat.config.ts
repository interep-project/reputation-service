import "@nomiclabs/hardhat-ethers"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig, task } from "hardhat/config"
import { resolve } from "path"
import "tsconfig-paths/register"
import { NetworksUserConfig } from "hardhat/types"
import { currentNetwork } from "src/config"

task("faucet", "Sends ETH to an address")
    .addPositionalParam("receiver", "The address that will receive them")
    .setAction(async ({ receiver }, { ethers }) => {
        const [sender] = await ethers.getSigners()

        const tx2 = await sender.sendTransaction({
            to: receiver,
            value: ethers.constants.WeiPerEther
        })
        await tx2.wait()

        console.log(`Transferred 1 ETH to ${receiver}`)
    })

dotenvConfig({ path: resolve(__dirname, "./.env") })

function getNetworks(): NetworksUserConfig | undefined {
    if (process.env.NODE_ENV === "production") {
        if (!process.env.INFURA_API_KEY) {
            throw new Error("Please set your INFURA_API_KEY in a .env file")
        }

        if (!process.env.BACKEND_PRIVATE_KEY) {
            throw new Error("Please set your BACKEND_PRIVATE_KEY in a .env file")
        }

        const infuraApiKey = process.env.INFURA_API_KEY
        const accounts = [`0x${process.env.BACKEND_PRIVATE_KEY}`]

        return {
            ropsten: {
                url: `https://ropsten.infura.io/v3/${infuraApiKey}`,
                chainId: 3,
                accounts
            },
            kovan: {
                url: `https://kovan.infura.io/v3/${infuraApiKey}`,
                chainId: 42,
                accounts
            },
            arbitrum: {
                url: "https://arb1.arbitrum.io/rpc",
                chainId: 42161,
                accounts
            }
        }
    }

    return undefined
}

const config: HardhatUserConfig = {
    defaultNetwork: currentNetwork.name,
    networks: getNetworks(),
    paths: {
        artifacts: "contracts/artifacts",
        sources: "contracts/contracts",
        tests: "contracts/test",
        cache: "contracts/cache"
    }
}

export default config
