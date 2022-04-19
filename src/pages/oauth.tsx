import {
    Container,
    Divider,
    Heading,
    HStack,
    IconButton,
    Image,
    Spinner,
    Stack,
    Table,
    TableCaption,
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
import React, { useCallback, useContext, useEffect, useState } from "react"
import { IconType } from "react-icons"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { MdArrowBack } from "react-icons/md"
import { GroupBox, GroupBoxButton, GroupBoxContent, GroupBoxHeader } from "src/components/group-box"
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
    const [session] = useSession()
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { _account, _identityCommitment } = useContext(EthereumWalletContext)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_group, setGroup] = useState<Group>()
    const [_reputationCriteria, setReputationCriteria] = useState<ReputationCriteria>()
    const { hasIdentityCommitment, joinGroup, getGroup, hasJoinedAGroup } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (session && _identityCommitment) {
                let hasJoined = await hasIdentityCommitment(
                    _identityCommitment,
                    session.provider,
                    session.user.reputation as ReputationLevel
                )

                if (hasJoined === null) {
                    return
                }

                hasJoined = hasJoined || (await hasJoinedAGroup(session.provider))

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

    function mapUserParameter(parameter: any): string {
        if (typeof parameter === "boolean") {
            return parameter === true ? "Yes" : "No"
        }

        return parameter.toString()
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <HStack spacing="0" mb="4">
                <IconButton onClick={() => signOut()} aria-label="Back" variant="link" icon={<MdArrowBack />} />
                <Text fontWeight="bold">Back</Text>
            </HStack>

            <Divider />

            <Stack direction={["column", "column", "row"]} mt="6" spacing="10">
                <VStack flex="1" align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Anonymously use your social reputation on-chain
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        Check which reputation parameters you meet and generate a semaphore ID to get started joining
                        social groups.
                    </Text>
                </VStack>
                <HStack flex="1" justify="center">
                    <Image src="./oauth-illustration.svg" alt="Social network illustration" />
                </HStack>
            </Stack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" my="12">
                <Step label="Authorize provider" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join social network group" />
            </Steps>

            {!_account ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to connect your wallet!
                </Text>
            ) : !_identityCommitment ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to generate your Semaphore ID!
                </Text>
            ) : !session || !_group ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <Stack direction={["column", "column", "column", "row"]} spacing="4">
                    <GroupBox>
                        <GroupBoxHeader
                            title={capitalize(_group.name)}
                            icon={oAuthIcons[session.provider]}
                            joined={_hasJoined}
                        />
                        <GroupBoxContent group={_group} />
                        <GroupBoxButton
                            alertTitle="Confirm join"
                            alertMessage="You will not be able to leave this group after you have joined."
                            onClick={() => join()}
                            disabled={!_identityCommitment || _hasJoined}
                        >
                            Join
                        </GroupBoxButton>
                    </GroupBox>

                    <VStack flex="1" align="left" bg="background.800" p="5" borderRadius="4px">
                        <Heading as="h4" size="md" pb="3">
                            How you qualify
                        </Heading>

                        {_reputationCriteria && (
                            <>
                                <Table variant="grid" colorScheme="background">
                                    {session.user.reputation === ReputationLevel.UNRATED && (
                                        <TableCaption px="0" textAlign="left" fontSize="md" color="secondary.200">
                                            Unrated identity groups lack anti-sybil properties because there are no
                                            requirements to join. They are primarily used for testing purposes.
                                        </TableCaption>
                                    )}
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
                                            <Td>{session.user.username as string}</Td>
                                            {_reputationCriteria.parameters.map((parameter, i) => (
                                                <Td key={i.toString()}>
                                                    {mapUserParameter(session.user[parameter.name])}
                                                </Td>
                                            ))}
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </>
                        )}
                    </VStack>
                </Stack>
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
