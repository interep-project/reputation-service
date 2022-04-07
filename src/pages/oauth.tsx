import {
    Box,
    Container,
    Divider,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react"
import { getReputationCriteria, ReputationCriteria, ReputationLevel } from "@interep/reputation"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import { GetServerSideProps } from "next"
import { signOut, useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { IconType } from "react-icons"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { MdArrowBack } from "react-icons/md"
import { GroupBox, GroupBoxButton, GroupBoxHeader, GroupBoxOAuthContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"
import { mapReputationRule } from "src/utils/frontend"

const oAuthIcons: Record<string, IconType> = {
    twitter: FaTwitter,
    github: FaGithub,
    reddit: FaRedditAlien
}

export default function OAuthGroupPage(): JSX.Element {
    const router = useRouter()
    const [session] = useSession()
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { _account, _identityCommitment } = useContext(EthereumWalletContext)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_group, setGroup] = useState<Group>()
    const [_reputationCriteria, setReputationCriteria] = useState<ReputationCriteria>()
    const { hasIdentityCommitment, joinGroup, getGroup } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (session && _identityCommitment) {
                const hasJoined = await hasIdentityCommitment(
                    _identityCommitment,
                    session.provider,
                    session.user.reputation as ReputationLevel
                )

                if (hasJoined === null) {
                    return
                }

                setHasJoined(hasJoined)

                const reputationCriteria = getReputationCriteria(session.provider)

                setReputationCriteria(reputationCriteria)

                const group = await getGroup(session.provider, session.user.reputation as ReputationLevel)

                if (group) {
                    setGroup(group)
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, _identityCommitment])

    useEffect(() => {
        if (!session) {
            setStep(0)
        } else if (!_identityCommitment) {
            setStep(1)
        } else if (!_hasJoined) {
            setStep(2)
        } else {
            setStep(3)
        }
    }, [_account, session, _identityCommitment, _hasJoined, setStep])

    const join = useCallback(async () => {
        if (session && _identityCommitment && _group) {
            if (
                await joinGroup(_identityCommitment, session.provider, session.user.reputation as ReputationLevel, {
                    accountId: session.accountId
                })
            ) {
                setHasJoined(true)
                setGroup({ ..._group, size: (_group.size += 1) })
            }
        }
    }, [session, _identityCommitment, _group, joinGroup])

    async function back() {
        await signOut({ redirect: false })
        await router.push("/")
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <HStack spacing="0" mb="4">
                <IconButton onClick={() => back()} aria-label="Back" variant="link" icon={<MdArrowBack />} />
                <Text fontWeight="bold">Back</Text>
            </HStack>

            <Divider />

            <HStack my="6" spacing="6">
                <VStack align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Authenticate anonymously on-chain using off-chain reputation
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        To join Social network groups you will need to authorize each provider individually to share
                        your credentials with Interep.
                    </Text>
                </VStack>
                <Box bg="background.800" borderRadius="4px" h="180" w="700px" />
            </HStack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" py="4">
                <Step label="Authorize provider" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join social network group" />
            </Steps>

            {!session || !_group ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : !_account ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to connect your wallet!
                </Text>
            ) : !_identityCommitment ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to generate your Semaphore ID!
                </Text>
            ) : (
                <HStack spacing="4" align="start" my="6">
                    <GroupBox>
                        <GroupBoxHeader
                            title={capitalize(session.provider)}
                            icon={oAuthIcons[session.provider]}
                            joined={_hasJoined}
                        />
                        <GroupBoxOAuthContent groups={[_group]} icon={oAuthIcons[session.provider]} />
                        <GroupBoxButton
                            alertTitle="Confirm join"
                            alertMessage="You will not be able to leave this group after you have joined."
                            onClick={() => join()}
                            disabled={!_identityCommitment || _hasJoined}
                        >
                            Join
                        </GroupBoxButton>
                    </GroupBox>

                    <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                        <Heading as="h4" size="md" pl="6" py="2">
                            Qualifications
                        </Heading>
                        <Divider />
                        {_reputationCriteria && (
                            <Table variant="unstyled">
                                <Thead>
                                    <Tr>
                                        <Th />
                                        {_reputationCriteria.parameters.map((parameter, i) => (
                                            <Th key={i.toString()}>{parameter.name.replace(/([A-Z])/g, " $1")}</Th>
                                        ))}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {_reputationCriteria.reputationLevels
                                        .filter((reputation) => reputation.name === _group.name)
                                        .map((reputation, i) => (
                                            <Tr key={i.toString()}>
                                                <Td>{capitalize(reputation.name)} group</Td>
                                                {reputation.rules.map((rule, i) => (
                                                    <Td key={i.toString()}>{mapReputationRule(rule)}</Td>
                                                ))}
                                            </Tr>
                                        ))}
                                    <Tr>
                                        <Td>{session.user.name}</Td>
                                        {_reputationCriteria.parameters.map((parameter, i) => (
                                            <Td key={i.toString()}>{session.user[parameter.name] as any}</Td>
                                        ))}
                                    </Tr>
                                </Tbody>
                            </Table>
                        )}
                    </VStack>
                </HStack>
            )}
        </Container>
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
