import { Heading, HStack, Icon, Link, Spinner, Text, Tooltip, useColorMode, useToast, VStack } from "@chakra-ui/react"
import { ReputationLevel } from "@interrep/reputation-criteria"
import { ethers, Signer } from "ethers"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/client"
import { useCallback, useContext, useEffect, useState } from "react"
import { BiCoin } from "react-icons/bi"
import { FaInfoCircle } from "react-icons/fa"
import Step from "src/components/Step"
import { ContractName, currentNetwork } from "src/config"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage"
import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types"
import getContractAddress from "src/utils/common/getContractAddress"
import getContractInstance from "src/utils/common/getContractInstance"
import { checkLink, getUserTokens, linkAccounts, mintToken, unlinkAccounts } from "src/utils/frontend/api"
import capitalize from "src/utils/common/capitalize"
import { ExplorerDataType, getExplorerLink } from "src/utils/frontend/getExplorerLink"

export default function Badges(): JSX.Element {
    const [session] = useSession()
    const { colorMode } = useColorMode()
    const toast = useToast()
    const { _signer, _address, _networkId } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_loading, setLoading] = useState<boolean>(false)
    const [_token, setToken] = useState<ITokenDocument>()
    const [_currentStep, setCurrentStep] = useState<number>()

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

    async function sign(signer: Signer, message: string): Promise<string | null> {
        try {
            return await signer.signMessage(message)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    function walletIsConnected(networkId?: number, address?: string): boolean {
        return currentNetwork.chainId === networkId && !!address
    }

    const showUnexpectedError = useCallback(() => {
        toast({
            description: "Sorry, there was an unexpected error.",
            variant: "subtle",
            status: "error"
        })

        setLoading(false)
    }, [toast])

    useEffect(() => {
        ;(async () => {
            if (session && walletIsConnected(_networkId, _address)) {
                const { user } = session

                if (user.reputation !== ReputationLevel.GOLD) {
                    setCurrentStep(0)
                    return
                }

                const accountLinked = await checkLink()

                if (accountLinked === null) {
                    showUnexpectedError()
                    return
                }

                if (accountLinked) {
                    const tokens = await getUserTokens({ userAddress: _address as string })

                    if (tokens === null || tokens.length === 0) {
                        showUnexpectedError()

                        return
                    }

                    const token = tokens[tokens.length - 1] as ITokenDocument

                    switch (token.status) {
                        case TokenStatus.NOT_MINTED:
                            setCurrentStep(2)
                            break
                        case TokenStatus.MINTED:
                            setCurrentStep(3)
                            break
                        case TokenStatus.BURNED:
                            setCurrentStep(4)
                            break
                        default:
                            setCurrentStep(1)
                    }

                    setToken(token)
                    return
                }

                setCurrentStep(1)
            }
        })()
    }, [session, _address, _networkId, showUnexpectedError])

    async function linkAccount(signer: Signer, address: string, web2AccountId: string): Promise<void> {
        setLoading(true)

        const publicKey = await getPublicKey()

        if (!publicKey) {
            toast({
                description: "Public key is needed to link the accounts.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        const message = createUserAttestationMessage({
            checksummedAddress: address,
            web2AccountId
        })

        const userSignature = await sign(signer, message)

        if (!userSignature) {
            toast({
                description: "Your signature is needed to link the accounts.",
                variant: "subtle",
                isClosable: true
            })
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
        setCurrentStep(2)
    }

    async function mint(token: ITokenDocument): Promise<void> {
        setLoading(true)

        const response = await mintToken({ tokenId: token._id })

        if (response === null) {
            showUnexpectedError()

            return
        }

        const tokens = await getUserTokens({ userAddress: token.userAddress })

        if (tokens === null) {
            showUnexpectedError()

            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
        setCurrentStep(3)
    }

    async function burn(token: ITokenDocument, signer: Signer): Promise<void> {
        setLoading(true)

        const contractAddress = getContractAddress(ContractName.REPUTATION_BADGE, token.web2Provider)

        if (contractAddress === null) {
            toast({
                description: "Cannot retrieve the badge's address.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        const contractInstance = getContractInstance(ContractName.REPUTATION_BADGE, contractAddress)

        try {
            const tx = await contractInstance.connect(signer).burn(token.decimalId)
            await tx.wait()
        } catch (error) {
            console.error(error)
            showUnexpectedError()
            return
        }

        const tokens = await getUserTokens({ userAddress: token.userAddress })

        if (tokens === null) {
            showUnexpectedError()

            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
        setCurrentStep(4)
    }

    async function unlinkAccount(token: ITokenDocument): Promise<void> {
        setLoading(true)

        const decryptedAttestation = await decrypt(token.encryptedAttestation)

        if (!decryptedAttestation) {
            toast({
                description: "Public key is needed to unlink the accounts.",
                variant: "subtle",
                isClosable: true
            })
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
        setCurrentStep(1)
    }

    return (
        <>
            <Heading as="h2" size="xl">
                Reputation Bedges
                <Tooltip
                    label="Reputation badges will allow you to prove your reputation by minting an ERC721 token on Ethereum."
                    placement="right-start"
                >
                    <span>
                        <Icon
                            boxSize="20px"
                            ml="10px"
                            mb="5px"
                            color={colorMode === "light" ? "gray.500" : "background.200"}
                            as={FaInfoCircle}
                        />
                    </span>
                </Tooltip>
            </Heading>

            {!walletIsConnected(_networkId, _address) ? (
                <VStack h="300px" align="center" justify="center">
                    <Text fontSize="lg">Please, connect your wallet correctly!</Text>
                </VStack>
            ) : !session || _currentStep === undefined ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <>
                    <HStack mt="10px">
                        {_token &&
                            _token.status === TokenStatus.MINTED &&
                            _token.mintTransactions &&
                            _token.mintTransactions[0] && (
                                <Link
                                    href={getExplorerLink(
                                        _token.mintTransactions[0].response.hash,
                                        ExplorerDataType.TRANSACTION
                                    )}
                                    isExternal
                                    px="10px"
                                >
                                    <Icon
                                        boxSize="70px"
                                        color={colorMode === "light" ? "gold.600" : "gold.500"}
                                        as={BiCoin}
                                    />
                                </Link>
                            )}
                        <Text fontWeight="semibold">
                            {session.user.reputation !== ReputationLevel.GOLD
                                ? `Sorry, you can create a badge only if your reputation is ${ReputationLevel.GOLD}.`
                                : _token?.status === TokenStatus.NOT_MINTED
                                ? `Your Ethereum/${capitalize(
                                      session.web2Provider
                                  )} accounts are linked. Mint a token to create your reputation badge.`
                                : _token?.status === TokenStatus.MINTED
                                ? `You have a ${capitalize(
                                      session.web2Provider
                                  )} reputation bedge. Follow the steps below if you want to burn the token or unlink your accounts.`
                                : _token?.status === TokenStatus.BURNED
                                ? `You burnt your token. Unlink your accounts and create another badge.`
                                : "Follow the steps below to create your reputation badge."}
                        </Text>
                    </HStack>

                    <VStack mt="30px" spacing={4} align="left">
                        <Step
                            title="Step 1"
                            message={`Link your Ethereum/${capitalize(session.web2Provider)} accounts.`}
                            actionText="Link accounts"
                            actionFunction={() =>
                                linkAccount(_signer as Signer, _address as string, session.web2AccountId)
                            }
                            loading={_currentStep === 1 && _loading}
                            disabled={_currentStep !== 1}
                        />
                        <Step
                            title="Step 2"
                            message="Mint your ERC721 token."
                            actionText="Mint token"
                            actionFunction={() => mint(_token as ITokenDocument)}
                            loading={_currentStep === 2 && _loading}
                            disabled={_currentStep !== 2}
                        />
                        <Step
                            title="Step 3"
                            message="Burn your ERC721 token."
                            actionText="Burn token"
                            actionFunction={() => burn(_token as ITokenDocument, _signer as Signer)}
                            loading={_currentStep === 3 && _loading}
                            disabled={_currentStep !== 3}
                        />
                        <Step
                            title="Step 4"
                            message={`Unlink your Ethereum/${capitalize(session.web2Provider)} accounts.`}
                            actionText="Unlink accounts"
                            actionFunction={() => unlinkAccount(_token as ITokenDocument)}
                            loading={_currentStep === 4 && _loading}
                            disabled={_currentStep !== 4}
                        />
                    </VStack>
                </>
            )}
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (authorized) {
        return {
            props: {}
        }
    }

    return {
        redirect: {
            destination: "/",
            permanent: false
        }
    }
}
