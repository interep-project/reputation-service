import { providers } from "ethers"
import { currentNetwork, SupportedChainId } from "src/config"
import { NetworkData } from "src/types/network"

export default function getProvider(network: NetworkData = currentNetwork) {
    let url: string

    switch (network.chainId) {
        case SupportedChainId.LOCALHOST:
            url = "http://localhost:8545"
            break
        case SupportedChainId.ARBITRUM:
            url = "https://arb1.arbitrum.io/rpc"
            break
        case SupportedChainId.ARBITRUM_TESTNET:
            url = "https://rinkeby.arbitrum.io/rpc"
            break
        default:
            if (!process.env.INFURA_API_KEY) {
                throw new Error("Please set your INFURA_API_KEY in a .env file")
            }

            url = `https://${network.name}.infura.io/v3/${process.env.INFURA_API_KEY}`
    }

    return new providers.JsonRpcProvider(url)
}
