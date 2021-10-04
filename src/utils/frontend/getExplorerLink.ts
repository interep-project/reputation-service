import { currentNetwork, SupportedChainId } from "src/config"
import { NetworkData } from "src/types/network"

function getEtherscanPrefix(networkData: NetworkData): string {
    switch (networkData.chainId) {
        case SupportedChainId.KOVAN:
        case SupportedChainId.ROPSTEN:
            return `${networkData.name}.`
        default:
            return ""
    }
}

export enum ExplorerDataType {
    TRANSACTION = "transaction",
    TOKEN = "token",
    ADDRESS = "address",
    BLOCK = "block"
}

/**
 * Return the explorer link for the given data and data type.
 * @param data The data to return a link for.
 * @param type The type of the data.
 * @returns the explorer link.
 */
export function getExplorerLink(data: string, type: ExplorerDataType): string {
    const url = `https://${getEtherscanPrefix(currentNetwork)}etherscan.io`

    switch (type) {
        case ExplorerDataType.TRANSACTION:
            return `${url}/tx/${data}`

        case ExplorerDataType.TOKEN:
            return `${url}/token/${data}`

        case ExplorerDataType.BLOCK:
            return `${url}/block/${data}`

        case ExplorerDataType.ADDRESS:
            return `${url}/address/${data}`
        default:
            return `${url}`
    }
}
