import React from "react"
import { Signer } from "ethers"

export type EthereumWalletContextType = {
    _networkId?: number
    _signer?: Signer
    _address?: string
    check: () => Promise<void>
    connect: () => Promise<void>
}

export default React.createContext<EthereumWalletContextType | null>(null)
