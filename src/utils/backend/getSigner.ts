/* istanbul ignore file */
import { Signer, Wallet } from "ethers"
import { currentNetwork } from "src/config"
import { NetworkData } from "src/types/network"
import getProvider from "./getProvider"

export default async function getSigner(network: NetworkData = currentNetwork): Promise<Signer> {
    const provider = getProvider(network)
    const accounts = await provider.listAccounts()

    if (accounts.length === 0) {
        if (!process.env.BACKEND_PRIVATE_KEY) {
            throw new Error("Please set your BACKEND_PRIVATE_KEY in a .env file")
        }

        return new Wallet(process.env.BACKEND_PRIVATE_KEY, provider)
    }

    return provider.getSigner()
}
