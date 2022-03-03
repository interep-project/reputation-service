import { Signer } from "ethers"
import React from "react"

export type EthereumWalletContextType = {
    _account?: string
    _signer?: Signer
    connect: () => Promise<void>
}

export default React.createContext<EthereumWalletContextType>({
    connect: () => Promise.resolve()
})
