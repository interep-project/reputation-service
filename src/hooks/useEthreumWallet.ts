import Onboard from "bnc-onboard"
import { Wallet, API } from "bnc-onboard/dist/src/interfaces"
import { ethers, Signer } from "ethers"
import { getAddress } from "ethers/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork"

const defaultNetworkId = getDefaultNetworkId()

export default function useEthereumWallet(): EthereumWalletContextType {
    const [_onboard, setOnboard] = useState<API>()
    const [_signer, setSigner] = useState<Signer>()
    const [_address, setAddress] = useState<string>()
    const [_networkId, setNetworkId] = useState<number>()

    useEffect(() => {
        (async () => {
            if (_onboard) {
                return
            }

            const onboard = Onboard({
                networkId: defaultNetworkId,
                hideBranding: true,
                walletSelect: {
                    wallets: [{ walletName: "metamask", preferred: true }]
                },
                walletCheck: [{ checkName: "connect" }, { checkName: "accounts" }, { checkName: "network" }],
                subscriptions: {
                    address: async (address: string) => {
                        if (!address) {
                            onboard.walletReset()
                            setSigner(undefined)
                            setAddress(undefined)
                            return
                        }

                        try {
                            setAddress(getAddress(address))
                        } catch (error) {
                            console.error(error)
                        }
                    },
                    wallet: (wallet: Wallet) => {
                        if (wallet?.provider) {
                            const provider = new ethers.providers.Web3Provider(wallet.provider)

                            setSigner(provider.getSigner())
                        }
                    },
                    network: (networkId: number) => {
                        setNetworkId(networkId)
                    }
                }
            })

            await onboard.walletSelect("MetaMask")

            setOnboard(onboard)
        })()
    }, [_onboard])

    const check = useCallback(async () => {
        if (!_onboard) {
            return
        }

        try {
            if (!(await _onboard.walletCheck())) {
                _onboard.walletReset()
            }
        } catch (error) {
            console.error(error)
        }
    }, [_onboard])

    const connect = useCallback(async () => {
        if (!_onboard) {
            return
        }

        await _onboard.walletSelect("MetaMask")

        await check()
    }, [_onboard, check])

    return {
        _networkId,
        _signer,
        _address,
        check,
        connect
    }
}
