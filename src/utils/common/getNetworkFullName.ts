/**
 * Returns the full name of a known Ethereum network.
 * @param networkId The network id.
 * @returns The network full name.
 */
export default function getNetworkFullName(networkId: number): string | undefined {
    return {
        1: "Ethereum Mainnet",
        3: "Ropsten",
        4: "Rinkeby",
        5: "Goerli",
        42: "Kovan",
        56: "Binance Smart Chain",
        100: "xDAI Chain",
        137: "Matic Mainnet",
        31337: "Hardhat",
        421611: "Arbitrum Testnet",
        42161: "Arbitrum One"
    }[networkId]
}
