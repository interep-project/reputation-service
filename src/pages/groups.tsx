import { Heading, Icon, Spinner, Text, Tooltip, useColorMode, useToast, VStack } from "@chakra-ui/react"
import { Web2Provider } from "@interrep/reputation-criteria"
import semethid from "@interrep/semethid"
import { babyJub, poseidon } from "circomlib"
import { Signer } from "ethers"
import { GetServerSideProps } from "next"
import { useSession } from "next-auth/client"
import { useCallback, useContext, useEffect, useState } from "react"
import { FaInfoCircle } from "react-icons/fa"
import Step from "src/components/Step"
import { currentNetwork } from "src/config"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { Group } from "src/types/groups"
import { addIdentityCommitment, checkGroup, checkIdentityCommitment, getGroup } from "src/utils/frontend/api"
import { capitalize } from "src/utils/frontend/capitalize"

export default function Groups(): JSX.Element {
    const [session] = useSession()
    const { colorMode } = useColorMode()
    const toast = useToast()
    const { _signer, _address, _networkId } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_loading, setLoading] = useState<boolean>(false)
    const [_description, setDescription] = useState<string>()
    const [_group, setGroup] = useState<Group | null>(null)
    const [_currentStep, setCurrentStep] = useState<number>(0)

    function walletIsConnected(networkId?: number, address?: string): boolean {
        return currentNetwork.id === networkId && !!address
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
                const hasJoinedAGroup = await checkGroup()
                const { web2Provider, user } = session

                if (hasJoinedAGroup === null) {
                    showUnexpectedError()
                    return
                }

                if (hasJoinedAGroup) {
                    setDescription(`It seems you already joined a ${capitalize(web2Provider as string)} group.`)
                    setLoading(false)
                    return
                }

                const group = await getGroup({
                    groupId: `${web2Provider.toUpperCase()}_${user.reputation}`
                })

                if (group === null) {
                    showUnexpectedError()
                    return
                }

                setGroup(group)
                setDescription(
                    `The ${user.reputation} ${capitalize(web2Provider as string)} group has ${
                        group.size
                    } members. Follow the steps below to join it.`
                )
                setCurrentStep(1)
            }
        })()
    }, [session, _networkId, _address, showUnexpectedError])

    async function retrieveIdentityCommitment(signer: Signer, web2Provider: Web2Provider): Promise<string | null> {
        try {
            const identity = await semethid((message) => signer.signMessage(message), capitalize(web2Provider))

            return poseidon([
                babyJub.mulPointEscalar(identity.keypair.pubKey, 8)[0],
                identity.identityNullifier,
                identity.identityTrapdoor
            ]).toString()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function retrieveAndCheckIdentityCommitment(
        signer: Signer,
        groupId: string,
        web2Provider: Web2Provider
    ): Promise<void> {
        setLoading(true)

        const identityCommitment = await retrieveIdentityCommitment(signer, web2Provider)

        if (!identityCommitment) {
            toast({
                description: "Your signature is needed to create the identity commitment.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        const alreadyExist = await checkIdentityCommitment({
            groupId,
            identityCommitment
        })

        if (alreadyExist === null) {
            showUnexpectedError()
            return
        }

        if (alreadyExist) {
            toast({
                description: `You already joined this group with another ${capitalize(web2Provider)} account`,
                variant: "subtle",
                isClosable: true
            })
        }

        setIdentityCommitment(identityCommitment)
        setLoading(false)
        setCurrentStep(2)
    }

    async function joinGroup(groupId: string, web2AccountId: string): Promise<void> {
        setLoading(true)

        const rootHash = await addIdentityCommitment({
            groupId,
            identityCommitment: _identityCommitment as string,
            web2AccountId
        })

        if (rootHash === null) {
            showUnexpectedError()
            return
        }

        setLoading(false)
        setCurrentStep(0)
        setDescription(
            `You joined the ${session?.user.reputation} ${capitalize(session?.web2Provider as string)} group correctly.`
        )
    }

    return (
        <>
            <Heading as="h2" size="xl">
                Semaphore Groups
                <Tooltip
                    label="Semaphore groups will allow you to access services and DApps using InterRep."
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
            ) : !session || !_description ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <>
                    <Text mt="10px">{_description}</Text>

                    <VStack mt="30px" spacing={4} align="left">
                        <Step
                            title="Step 1"
                            message="Create your Semaphore identity."
                            buttonText="Create Identity"
                            buttonFunction={() =>
                                retrieveAndCheckIdentityCommitment(
                                    _signer as Signer,
                                    _group?.id as string,
                                    session.web2Provider as Web2Provider
                                )
                            }
                            loading={_currentStep === 1 && _loading}
                            disabled={_currentStep !== 1}
                        />
                        <Step
                            title="Step 2"
                            message={`Join the ${session.user.reputation} ${capitalize(
                                session.web2Provider as string
                            )} group.`}
                            buttonText="Join Group"
                            buttonFunction={() => joinGroup(_group?.id as string, session.web2AccountId as string)}
                            loading={_currentStep === 2 && _loading}
                            disabled={_currentStep !== 2}
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
