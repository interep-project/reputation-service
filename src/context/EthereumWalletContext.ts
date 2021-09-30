import { Signer } from "ethers"
import React from "react"
import { PoapGroupId } from "src/core/groups/poap"

export type EthereumWalletContextType = {
    _networkId?: number
    _signer?: Signer
    _address?: string
    _poapGroupIds?: PoapGroupId[]
    check: () => Promise<void>
    connect: () => Promise<void>
}

export default React.createContext<EthereumWalletContextType | null>(null)
