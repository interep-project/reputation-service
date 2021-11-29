import { Signer } from "ethers"
import React from "react"
import { PoapEvent } from "src/core/poap"

export type EthereumWalletContextType = {
    _networkId?: number
    _signer?: Signer
    _address?: string
    _poapEvents: PoapEvent[]
    check: () => Promise<void>
    connect: () => Promise<void>
}

export default React.createContext<EthereumWalletContextType | null>(null)
