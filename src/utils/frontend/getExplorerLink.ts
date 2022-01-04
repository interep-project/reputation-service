import { currentNetwork } from "src/config"

export enum ExplorerDataType {
    TRANSACTION = "tx",
    TOKEN = "token",
    BLOCK = "block",
    ADDRESS = "address"
}

/**
 * Return the explorer link for the given data and data type.
 * @param type The type of the data.
 * @param data The data to return a link for.
 * @returns The explorer link.
 */
export default function getExplorerLink(type: ExplorerDataType, data: string): string {
    return `https://${currentNetwork.name}.etherscan.io/${type}/${data}`
}
