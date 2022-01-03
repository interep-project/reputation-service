import { Heading, HStack, Icon, Link, Spinner, Text, Tooltip, useColorMode, useToast, VStack } from "@chakra-ui/react"
import type { TokenDocument } from "@interrep/db"
import { ReputationLevel } from "@interrep/reputation"
import { Signer } from "ethers"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/client"
import { useContext, useEffect, useState } from "react"
import { BiCoin } from "react-icons/bi"
import { FaInfoCircle } from "react-icons/fa"
import Step from "src/components/Step"
import { ContractName, currentNetwork } from "src/config"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import createUserMessage from "src/core/badges/createUserMessage"
import useInterRepAPI from "src/hooks/useInterRepAPI"
import { capitalize, delay, getContractAddress, getContractInstance } from "src/utils/common"
import { ExplorerDataType, getExplorerLink } from "src/utils/frontend/getExplorerLink"

export default function Badges(): JSX.Element {
    const [session] = useSession()
    const { colorMode } = useColorMode()
    const toast = useToast()
    const { _signer, _address, _networkId } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_loading, setLoading] = useState<boolean>(false)
    const [_token, setToken] = useState<TokenDocument>()
    const [_currentStep, setCurrentStep] = useState<number>()
    const { isLinkedToAddress, getUserBadges, linkAccounts, mintBadge, unlinkAccounts } = useInterRepAPI()

    async function getPublicKey(): Promise<string | null> {
        try {
            // @ts-ignore: ignore
            const publicKey = await window.ethereum.request({
                method: "eth_getEncryptionPublicKey",
                params: [_address]
            })

            return publicKey
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
                params: [messageToDecrypt, _address]
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

    useEffect(() => {
        ;(async () => {
            if (session && walletIsConnected(_networkId, _address)) {
                const { user } = session

                if (user.reputation !== ReputationLevel.GOLD) {
                    setCurrentStep(0)
                    return
                }

                const isLinked = await isLinkedToAddress()

                if (isLinked === null) {
                    return
                }

                if (isLinked) {
                    const tokens = await getUserBadges({ userAddress: _address as string })

                    if (tokens === null || tokens.length === 0) {
                        return
                    }

                    const token = tokens[tokens.length - 1] as TokenDocument

                    switch (token.status) {
                        case "MINTED":
                            setCurrentStep(3)
                            break
                        case "BURNED":
                            setCurrentStep(4)
                            break
                        default:
                            setCurrentStep(2)
                    }

                    setToken(token)
                    return
                }
                setCurrentStep(1)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, _address, _networkId])

    async function link(signer: Signer, address: string, accountId: string): Promise<void> {
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

        await delay(500)

        const attestationMessage = createUserMessage(address, accountId)
        const userSignature = await sign(signer, attestationMessage)

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
            userAddress: address,
            accountId,
            userSignature,
            userPublicKey: publicKey
        })

        if (newToken === null) {
            setLoading(false)
            return
        }

        setToken(newToken)
        setLoading(false)
        setCurrentStep(2)
    }

    async function mint(token: TokenDocument, accountId: string): Promise<void> {
        setLoading(true)

        const response = await mintBadge({ tokenId: token._id, accountId })

        if (response === null) {
            setLoading(false)
            return
        }

        const tokens = await getUserBadges({ userAddress: token.userAddress })

        if (tokens === null) {
            setLoading(false)
            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
        setCurrentStep(3)
    }

    async function burn(token: TokenDocument, signer: Signer): Promise<void> {
        setLoading(true)

        const contractAddress = getContractAddress(ContractName.REPUTATION_BADGE, token.provider)

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
            const transaction = await contractInstance.connect(signer).burn(token.tokenId)

            await transaction.wait(1)
        } catch (error) {
            console.error(error)
            toast({
                description: "Transaction failed, check your wallet.",
                variant: "subtle",
                status: "error"
            })
            setLoading(false)
            return
        }

        const tokens = await getUserBadges({ userAddress: token.userAddress })

        if (tokens === null) {
            setLoading(false)
            return
        }

        setToken(tokens[tokens.length - 1])
        setLoading(false)
        setCurrentStep(4)
    }

    async function unlink(token: TokenDocument, accountId: string): Promise<void> {
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

        const [attestation] = JSON.parse(decryptedAttestation)
        const [attestationMessage, attestationSignature] = JSON.parse(attestation)
        const response = await unlinkAccounts({ attestationMessage, attestationSignature, accountId })

        if (response === null) {
            setLoading(false)
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
                        {_token && _token.status === "MINTED" && _token.transaction && (
                            <Link
                                href={getExplorerLink(_token.transaction.hash, ExplorerDataType.TRANSACTION)}
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
                                : _token && !_token.status
                                ? `Your Ethereum/${capitalize(
                                      session.provider
                                  )} accounts are linked. Mint a token to create your reputation badge.`
                                : _token?.status === "MINTED"
                                ? `You have a ${capitalize(
                                      session.provider
                                  )} reputation badge. Follow the steps below if you want to burn the token or unlink your accounts.`
                                : _token?.status === "BURNED"
                                ? `You burnt your token. Unlink your accounts and create another badge.`
                                : "Follow the steps below to create your reputation badge."}
                        </Text>
                    </HStack>

                    <VStack mt="30px" spacing={4} align="left">
                        <Step
                            title="Step 1"
                            message={`Link your Ethereum/${capitalize(session.provider)} accounts.`}
                            actionText="Link accounts"
                            actionFunction={() => link(_signer as Signer, _address as string, session.accountId)}
                            loading={_currentStep === 1 && _loading}
                            disabled={_currentStep !== 1}
                        />
                        <Step
                            title="Step 2"
                            message="Mint your ERC721 token."
                            actionText="Mint token"
                            actionFunction={() => mint(_token as TokenDocument, session.accountId)}
                            loading={_currentStep === 2 && _loading}
                            disabled={_currentStep !== 2}
                        />
                        <Step
                            title="Step 3"
                            message="Burn your ERC721 token."
                            actionText="Burn token"
                            actionFunction={() => burn(_token as TokenDocument, _signer as Signer)}
                            loading={_currentStep === 3 && _loading}
                            disabled={_currentStep !== 3}
                        />
                        <Step
                            title="Step 4"
                            message={`Unlink your Ethereum/${capitalize(session.provider)} accounts.`}
                            actionText="Unlink accounts"
                            actionFunction={() => unlink(_token as TokenDocument, session.accountId)}
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
