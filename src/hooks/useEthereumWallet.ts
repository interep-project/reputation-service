import detectEthereumProvider from "@metamask/detect-provider"
import { providers, Signer } from "ethers"
import { useEffect, useState } from "react"
import { EthereumWalletContextType } from "src/context/EthereumWalletContext"

export default function useEthereumWallet(): EthereumWalletContextType {
    const [_ethereumProvider, setEthereumProvider] = useState<any>()
    const [_account, setAccount] = useState<string>()
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

                setAccount(accounts[0])
                setSigner(ethersProvider.getSigner())

                _ethereumProvider.on("accountsChanged", (newAccounts: string[]) => {
                    if (newAccounts.length !== 0) {
                        setAccount(newAccounts[0])
                        setSigner(ethersProvider.getSigner())
                    } else {
                        setAccount(undefined)
                        setSigner(undefined)
                    }
                })
            }
        })()
    }, [_ethereumProvider])

    async function connect() {
        _ethereumProvider.request({ method: "eth_requestAccounts" })
    }

    return {
        _account,
        _signer,
        connect
    }
}
