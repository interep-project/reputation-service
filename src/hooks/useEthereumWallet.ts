import createIdentity from "@interep/identity"
import detectEthereumProvider from "@metamask/detect-provider"
import { providers, Signer, utils } from "ethers"
import { getAddress } from "ethers/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function useEthereumWallet(): EthereumWalletContextType {
    const [_ethereumProvider, setEthereumProvider] = useState<any>()
    const [_account, setAccount] = useState<string>()
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_signer, setSigner] = useState<Signer>()

    useEffect(() => {
        ;(async function IIFE() {
            if (!_ethereumProvider) {
                const ethereumProvider = (await detectEthereumProvider()) as any

                if (ethereumProvider) {
                    setEthereumProvider(ethereumProvider)
                } else {
                    console.error("Please install Metamask!")
                }
            } else {
                const accounts = await _ethereumProvider.request({ method: "eth_accounts" })
                const ethersProvider = new providers.Web3Provider(_ethereumProvider)

                setAccount(getAddress(accounts[0]))
                setSigner(ethersProvider.getSigner())

                _ethereumProvider.on("accountsChanged", (newAccounts: string[]) => {
                    if (newAccounts.length !== 0) {
                        setAccount(getAddress(newAccounts[0]))
                        setSigner(ethersProvider.getSigner())
                    } else {
                        setAccount(undefined)
                        setSigner(undefined)
                    }
                })
            }
        })()
    }, [_ethereumProvider])

    const connect = useCallback(async () => _ethereumProvider.request({ method: "eth_requestAccounts" }), [
        _ethereumProvider
    ])

    const generateIdentityCommitment = useCallback(
        async (provider: Provider) => {
            if (!_signer || !_account) {
                console.error("You cannot generate any identity commitment without a connected wallet")

                return
            }

            try {
                const identity = await createIdentity((message) => _signer.signMessage(message), capitalize(provider))
                const identityCommitment = identity.genIdentityCommitment().toString()

                localStorage.setItem(`ic-${utils.id(provider + _account)}`, identityCommitment)

                setIdentityCommitment(identityCommitment)
            } catch (error) {
                console.error(error)
            }
        },
        [_signer, _account]
    )

    const signMessage = useCallback(
        async (message: string): Promise<string | null> => {
            if (!_signer) {
                console.error("You cannot sign any message without a connected wallet")

                return null
            }

            try {
                return await _signer.signMessage(message)
            } catch (error) {
                console.error(error)

                return null
            }
        },
        [_signer]
    )

    const retrieveIdentityCommitment = useCallback(
        async (provider: Provider) => {
            if (!_account) {
                console.error("You cannot retrieve any identity commitment without a connected wallet")

                return
            }

            const identityCommitment = localStorage.getItem(`ic-${utils.id(provider + _account)}`)

            setIdentityCommitment(identityCommitment || undefined)
        },
        [_account]
    )

    return {
        _account,
        _identityCommitment,
        _signer,
        generateIdentityCommitment,
        signMessage,
        retrieveIdentityCommitment,
        setIdentityCommitment,
        connect
    }
}
