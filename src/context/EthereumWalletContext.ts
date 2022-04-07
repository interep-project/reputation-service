import { Signer } from "ethers"
import React from "react"
import { Provider } from "src/types/groups"

export type EthereumWalletContextType = {
    _account?: string
    _identityCommitment?: string
    _signer?: Signer
    connect: () => Promise<void>
    generateIdentityCommitment: (provider: Provider) => Promise<void>
    signMessage: (message: string) => Promise<string | null>
    retrieveIdentityCommitment: (provider: Provider) => Promise<void>
    setIdentityCommitment: (identityCommitment: string | undefined) => void
}

export default React.createContext<EthereumWalletContextType>({
    connect: () => Promise.resolve(),
    generateIdentityCommitment: () => Promise.resolve(),
    signMessage: () => Promise.resolve(null),
    retrieveIdentityCommitment: () => Promise.resolve(),
    setIdentityCommitment: () => null
})
