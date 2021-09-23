import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { capitalize, createStyles, IconButton, makeStyles, Theme } from "@material-ui/core"
import TwitterIcon from "@material-ui/icons/Twitter"
import GitHubIcon from "@material-ui/icons/GitHub"
import RedditIcon from "@material-ui/icons/Reddit"
import ReputationBadge from "contracts/artifacts/contracts/ReputationBadge.sol/ReputationBadge.json"
import { ethers, Signer } from "ethers"
import React, { useEffect } from "react"
import { ContractName } from "src/config"
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage"
import { ITokenDocument } from "src/models/tokens/Token.types"
import getContractAddress from "src/utils/crypto/getContractAddress"
import { checkLink, getMyTokens, linkAccounts, mintToken, unlinkAccounts } from "src/utils/frontend/api"
import { ExplorerDataType, getExplorerLink } from "src/utils/frontend/getExplorerLink"
import TabPanelContent from "./TabPanelContent"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        token: {
            borderWidth: 4,
            borderColor: "#D4D08E",
            borderStyle: "solid dashed",
            margin: theme.spacing(3)
        },
        tokenIcon: {
            color: "#D4D08E"
        }
    })
)

type Properties = {
    onArrowClick: (direction: -1 | 1) => void
    reputation: ReputationLevel
    address: string
    signer: Signer
    web2Provider: Web2Provider
    web2AccountId: string
}

export default function ReputationBadgeTabPanel({
    onArrowClick,
    reputation,
    address,
    signer,
    web2Provider,
    web2AccountId
}: Properties): JSX.Element {
    const classes = useStyles()
    const [_loading, setLoading] = React.useState<boolean>(false)
    const [_warningMessage, setWarningMessage] = React.useState<string>("")
    const [_token, setToken] = React.useState<ITokenDocument>()
    const [_error, setError] = React.useState<boolean>(false)

    async function getPublicKey(): Promise<string | null> {
        try {
            // @ts-ignore: ignore
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts"
            })
            // @ts-ignore: ignore
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            // @ts-ignore: ignore
            const pubKey = await provider.send("eth_getEncryptionPublicKey", [accounts[0]])

            return pubKey
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function decrypt(messageToDecrypt: string): Promise<string | null> {
        try {
            // @ts-ignore: ignore
            const decrypted = await window.ethereum.request({
                method: "eth_decrypt",
                // @ts-ignore: ignore
                params: [messageToDecrypt, window.ethereum.selectedAddress]
            })

            return decrypted
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function sign(message: string): Promise<string | null> {
        try {
            return await signer.signMessage(message)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    function showUnexpectedError(): void {
        setWarningMessage("Sorry, there was an unexpected error")
        setError(true)
        setLoading(false)
    }

    useEffect(() => {
        ;(async () => {
            setWarningMessage("")

            if (reputation !== ReputationLevel.GOLD) {
                setWarningMessage(`Sorry, you can create a badge only if your reputation is ${ReputationLevel.GOLD}`)
                return
            }

            setLoading(true)

            const accountLinked = await checkLink()

            if (accountLinked === null) {
                showUnexpectedError()

                return
            }

            if (accountLinked) {
                const tokens = await getMyTokens({ ownerAddress: address })

                if (tokens === null || tokens.length === 0) {
                    showUnexpectedError()

                    return
                }

                setToken(tokens[tokens.length - 1])
            }

            setLoading(false)
        })()
    }, [reputation, address])

    async function linkAccount(): Promise<void> {
        setWarningMessage("")
        setLoading(true)

        const publicKey = await getPublicKey()

        if (!publicKey) {
            setWarningMessage("Public key is needed to link accounts")
            setLoading(false)
            return
        }

        const message = createUserAttestationMessage({
            checksummedAddress: address,
            web2AccountId
        })

        const userSignature = await sign(message)

        if (!userSignature) {
            setWarningMessage("Your signature is needed to register your intent to link the accounts")
            setLoading(false)
            return
        }

        const newToken = await linkAccounts({
            address,
            web2AccountId,
            userSignature,
            userPublicKey: publicKey
        })

        if (newToken === null) {
            showUnexpectedError()

            return
        }

        setToken(newToken)
        setLoading(false)
    }

    async function mint(token: any): Promise<void> {
        setWarningMessage("")
        setLoading(true)

        const response = await mintToken({ tokenId: token._id })

        if (response === null) {
            showUnexpectedError()

            return
        }

        const tokens = await getMyTokens({ ownerAddress: address })

        if (tokens === null) {
            showUnexpectedError()

            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
    }

    async function burn(token: any): Promise<void> {
        setWarningMessage("")
        setLoading(true)

        const badgeAddress = getContractAddress(ContractName.REPUTATION_BADGE, token.web2Provider)

        if (badgeAddress === null) {
            setWarningMessage("Cannot retrieve the badge's address")
            setLoading(false)
            return
        }

        const badge = new ethers.Contract(badgeAddress, ReputationBadge.abi)

        try {
            const tx = await badge.connect(signer).burn(token.decimalId)
            await tx.wait()
        } catch (error) {
            console.error(error)
            showUnexpectedError()
            return
        }

        const tokens = await getMyTokens({ ownerAddress: address })

        if (tokens === null) {
            showUnexpectedError()

            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
    }

    async function unlinkAccount(token: any): Promise<void> {
        setWarningMessage("")
        setLoading(true)

        const decryptedAttestation = await decrypt(token.encryptedAttestation)

        if (!decryptedAttestation) {
            setWarningMessage("Public key is needed to link accounts")
            setLoading(false)
            return
        }

        const response = await unlinkAccounts({ decryptedAttestation })

        if (response === null) {
            showUnexpectedError()

            return
        }

        setToken(undefined)
        setLoading(false)
    }

    return (
        <>
            <TabPanelContent
                title="Reputation badge"
                description={
                    _error
                        ? ""
                        : _loading
                        ? "Loading..."
                        : !_token
                        ? "Link your Web2 account with your Ethereum address and mint your token to prove your reputation."
                        : _token?.status === "NOT_MINTED"
                        ? `Your ${capitalize(
                              web2Provider
                          )} account is linked to your Ethereum address. Mint your token to prove your reputation.`
                        : _token?.status === "MINTED"
                        ? "You have a minted token! Click on it to see the transaction on Etherscan."
                        : "You burnt your token. Unlink your accounts and link them another time to mint a new token."
                }
                onLeftArrowClick={onArrowClick}
                warningMessage={_warningMessage}
                loading={_loading}
                buttonText={
                    !_token
                        ? "Link your accounts"
                        : _token?.status === "NOT_MINTED"
                        ? "Mint token"
                        : _token?.status === "MINTED"
                        ? "Burn token"
                        : "Unlink your accounts"
                }
                onButtonClick={() =>
                    !_token || _loading
                        ? linkAccount()
                        : _token?.status === "NOT_MINTED"
                        ? mint(_token)
                        : _token?.status === "MINTED"
                        ? burn(_token)
                        : unlinkAccount(_token)
                }
                buttonDisabled={reputation !== ReputationLevel.GOLD || _loading || _error}
                reputation={reputation}
                contractName={ContractName.REPUTATION_BADGE}
                web2Provider={web2Provider}
            >
                {_token && _token.status === "MINTED" && _token.mintTransactions && _token.mintTransactions[0] ? (
                    <IconButton
                        className={classes.token}
                        href={getExplorerLink(_token.mintTransactions[0].response.hash, ExplorerDataType.TRANSACTION)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {web2Provider === Web2Provider.TWITTER ? (
                            <TwitterIcon className={classes.tokenIcon} fontSize="large" />
                        ) : web2Provider === Web2Provider.GITHUB ? (
                            <GitHubIcon className={classes.tokenIcon} fontSize="large" />
                        ) : (
                            <RedditIcon className={classes.tokenIcon} fontSize="large" />
                        )}
                    </IconButton>
                ) : undefined}
            </TabPanelContent>
        </>
    )
}
