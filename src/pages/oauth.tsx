import {
    Button,
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
import { getReputationCriteria, ReputationCriteria, ReputationLevel, ReputationRule } from "@interep/reputation"
import { GetServerSideProps } from "next"
import { signOut, useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { IoMdArrowRoundBack } from "react-icons/io"
import { MdLens } from "react-icons/md"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group } from "src/types/groups"
import { capitalize, formatNumber } from "src/utils/common"

export default function OAuthProviderPage(): JSX.Element {
    const router = useRouter()
    const [session] = useSession()
    const { _account, _signer } = useContext(EthereumWalletContext)
    const [_groupSize, setGroupSize] = useState<number>(0)
    const [_oAuthGroups, setOAuthGroups] = useState<Group[]>()
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_reputationCriteria, setReputationCriteria] = useState<ReputationCriteria>()
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const { retrieveIdentityCommitment, hasIdentityCommitment, joinGroup, getGroups, _loading } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (session) {
                const groups = await getGroups()

                if (groups) {
                    const oAuthGroups = groups.filter((g) => g.provider === session.provider)
                    const userGroup = oAuthGroups.find((g) => g.name === session.user.reputation) as Group

                    setOAuthGroups(oAuthGroups)
                    setGroupSize(userGroup.size)
                }

                setReputationCriteria(getReputationCriteria(session.provider))
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    async function back() {
        await signOut({ redirect: false })
        await router.push("/")
    }

    function mapReputationRule(rule: ReputationRule): string {
        if (rule.value !== null && typeof rule.value === "object") {
            if (rule.value["<"] !== undefined) {
                return `< ${formatNumber(rule.value["<"])}`
            }

            if (rule.value[">"] !== undefined) {
                return `> ${formatNumber(rule.value[">"])}`
            }
        }

        if (typeof rule.value === "number") {
            return formatNumber(rule.value)
        }

        if (typeof rule.value === "boolean") {
            return rule.value ? "Yes" : "No"
        }

        return ""
    }

    const step1 = useCallback(async () => {
        if (session && _signer) {
            const identityCommitment = await retrieveIdentityCommitment(_signer, session.provider)

            if (identityCommitment) {
                const hasJoined = await hasIdentityCommitment(
                    identityCommitment,
                    session.provider,
                    session.user.reputation as ReputationLevel,
                    true
                )

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setHasJoined(hasJoined)
            }
        }
    }, [session, _signer, retrieveIdentityCommitment, hasIdentityCommitment])

    const step2 = useCallback(async () => {
        if (session && _identityCommitment) {
            if (
                await joinGroup(_identityCommitment, session.provider, session.user.reputation as ReputationLevel, {
                    accountId: session.accountId
                })
            ) {
                setHasJoined(true)
                setGroupSize((v) => v + 1)
            }
        }
    }, [session, _identityCommitment, joinGroup])

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.lg">
            {!session || _loading ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <VStack align="left">
                    <HStack spacing="4" mb="10px" justify="space-between">
                        <HStack>
                            <IconButton
                                onClick={() => back()}
                                aria-label="Back"
                                variant="link"
                                icon={<IoMdArrowRoundBack />}
                            />
                            <Heading as="h2" size="xl" mb="10px">
                                {capitalize(session.provider)}
                            </Heading>
                        </HStack>

                        <HStack>
                            <MdLens color={session.user.reputation as string} />
                            <Text fontWeight="bold">{capitalize(session.user.reputation as string)} Group</Text>
                        </HStack>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between" spacing="8" py="20px">
                        <Text color="background.400" fontSize="md">
                            Interep uses Semaphore to generate anonymous identities. Lorem ipsum dolor sit amet,
                            consectetur adipisci elit, sed do eiusmod tempor incidunt ut labore et dolore magna aliqua.
                        </Text>

                        <Button
                            onClick={_identityCommitment ? step2 : step1}
                            colorScheme="background"
                            size="md"
                            minWidth="250px"
                            disabled={!_account || _hasJoined}
                        >
                            {_identityCommitment ? "Join Group" : "Generate Semaphore ID"}
                        </Button>
                    </HStack>

                    <Divider />

                    <Text color="background.400" fontSize="sm" py="20px">
                        Group qualification is based on account activity. Interep will prompt you every # days to
                        authorize a provider to share your most recent credentials.
                    </Text>

                    <HStack spacing="2">
                        <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                            <Heading as="h4" size="md" pl="6" py="2">
                                Groups
                            </Heading>
                            <Divider />
                            {_oAuthGroups && (
                                <Table variant="unstyled">
                                    <Thead>
                                        <Tr>
                                            <Th>Name</Th>
                                            <Th isNumeric>Members</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {_oAuthGroups.map((group) => (
                                            <Tr key={group.name}>
                                                <Td>
                                                    <HStack>
                                                        <MdLens color={group.name} />
                                                        <Text>{capitalize(group.name)}</Text>
                                                    </HStack>
                                                </Td>
                                                <Td isNumeric>
                                                    {group.name === session.user.reputation ? _groupSize : group.size}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            )}
                        </VStack>
                        <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                            <Heading as="h4" size="md" pl="6" py="2">
                                Qualifications
                            </Heading>
                            <Divider />
                            {_reputationCriteria && (
                                <Table variant="unstyled">
                                    <Thead>
                                        <Tr>
                                            {_reputationCriteria.parameters.map((parameter, i) => (
                                                <Th key={i.toString()}>{parameter.name.replace(/([A-Z])/g, " $1")}</Th>
                                            ))}
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {_reputationCriteria.reputationLevels.map((reputation) => (
                                            <Tr key={reputation.name}>
                                                {reputation.rules.map((rule, i) => (
                                                    <Td key={i.toString()}>{mapReputationRule(rule)}</Td>
                                                ))}
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            )}
                        </VStack>
                    </HStack>
                </VStack>
            )}
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}
