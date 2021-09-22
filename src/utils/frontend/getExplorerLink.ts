import { currentNetwork, supportedNetworks } from "src/config"

const ETHERSCAN_PREFIXES: { [chainId: string]: string } = {
    [supportedNetworks.kovan.id]: "kovan.",
    [supportedNetworks.ropsten.id]: "ropsten."
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
    const prefix = `https://${ETHERSCAN_PREFIXES[currentNetwork.id] ?? ""}etherscan.io`

    switch (type) {
        case ExplorerDataType.TRANSACTION:
            return `${prefix}/tx/${data}`

        case ExplorerDataType.TOKEN:
            return `${prefix}/token/${data}`

        case ExplorerDataType.BLOCK:
            return `${prefix}/block/${data}`

        case ExplorerDataType.ADDRESS:
            return `${prefix}/address/${data}`
        default:
            return `${prefix}`
    }
}
