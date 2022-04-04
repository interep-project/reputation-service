import {
    Box,
    Button,
    Container,
    Divider,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack
} from "@chakra-ui/react"
import {
    getReputationCriteria,
    OAuthProvider,
    ReputationCriteria,
    ReputationLevel,
    ReputationRule
} from "@interep/reputation"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import { signIn as _signIn, signOut, useSession } from "next-auth/client"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { GoSearch } from "react-icons/go"
import { MdArrowBack } from "react-icons/md"
import { AlertDialog } from "src/components/alert-dialog"
import { GroupBox, GroupBoxOAuthContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { capitalize, formatNumber } from "src/utils/common"

const oAuthProviders: Record<OAuthProvider, any> = {
    twitter: {
        provider: OAuthProvider.TWITTER,
        title: "Twitter",
        icon: FaTwitter,
        groupSizes: {}
    },
    github: {
        provider: OAuthProvider.GITHUB,
        title: "Github",
        icon: FaGithub,
        groupSizes: {}
    },
    reddit: {
        provider: OAuthProvider.REDDIT,
        title: "Reddit",
        icon: FaRedditAlien,
        groupSizes: {}
    }
}

export default function OAuthProvidersPage(): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [session] = useSession()
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { _account, _identityCommitment } = useContext(EthereumWalletContext)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_oAuthProvider, setOAuthProvider] = useState<string>("")
    const [_oAuthProviders, setOAuthProviders] = useState<any[]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("1")
    const [_reputationCriteria, setReputationCriteria] = useState<ReputationCriteria>()
    const { hasIdentityCommitment, joinGroup, getGroups } = useGroups()

    useEffect(() => {
        ;(async () => {
            const groups = await getGroups()

            if (groups) {
                for (const group of groups) {
                    if (group.provider in oAuthProviders) {
                        oAuthProviders[group.provider as OAuthProvider].groupSizes[group.name] = group.size
                    }
                }

                setOAuthProviders(Object.values(oAuthProviders))
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!_account) {
            setStep(0)
        } else if (!session) {
            setStep(1)
        } else if (!_identityCommitment) {
            setStep(2)
        } else if (!_hasJoined) {
            setStep(3)
        } else {
            setStep(4)
        }
    }, [_account, session, _identityCommitment, _hasJoined, setStep])

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
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, _identityCommitment])

    function getTotalGroupSizes(provider: any): number {
        const sizes = Object.values(provider.groupSizes) as number[]

        return sizes.reduce((t, c) => t + c, 0)
    }

    const sortCb = useCallback(
        (oAuthProviderA: any, oAuthProviderB: any) => {
            switch (_sortingValue) {
                case "2":
                    return oAuthProviderA.title.localeCompare(oAuthProviderB.title)
                case "3":
                    return oAuthProviderB.title.localeCompare(oAuthProviderA.title)
                case "1":
                default:
                    return getTotalGroupSizes(oAuthProviderB) - getTotalGroupSizes(oAuthProviderA)
            }
        },
        [_sortingValue]
    )

    const filterCb = useCallback(
        (oAuthProvider: any) => {
            const name = oAuthProvider.title.toLowerCase()

            return !_searchValue || name.includes(_searchValue.toLowerCase())
        },
        [_searchValue]
    )

    function selectOAuthProvider(oAuthProvider: OAuthProvider) {
        setOAuthProvider(oAuthProvider)
        onOpen()
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

    const join = useCallback(async () => {
        if (session && _identityCommitment) {
            if (
                await joinGroup(_identityCommitment, session.provider, session.user.reputation as ReputationLevel, {
                    accountId: session.accountId
                })
            ) {
                setHasJoined(true)
            }
        }
    }, [session, _identityCommitment, joinGroup])

    const signIn = useCallback(() => {
        _signIn(_oAuthProvider)
        onClose()
    }, [_oAuthProvider, onClose])

    function back() {
        signOut({ redirect: false })
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            {session && (
                <>
                    <HStack spacing="0" mb="4">
                        <IconButton onClick={() => back()} aria-label="Back" variant="link" icon={<MdArrowBack />} />
                        <Text fontWeight="bold">Back</Text>
                    </HStack>

                    <Divider />
                </>
            )}

            <HStack mb="6" mt={session ? 6 : 0} spacing="6">
                <VStack align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Authenticate anonymously on-chain using off-chain reputation
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        To join Social network groups you will need to authorize each provider individually to share
                        your credentials with Interep. Groups can be left at any time.
                    </Text>
                </VStack>
                <Box bg="background.800" borderRadius="4px" h="180" w="700px" />
            </HStack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" py="4">
                <Step label="Connect wallet" />
                <Step label="Authorize provider" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join social network group" />
            </Steps>

            {session ? (
                <HStack spacing="4" align="start" my="6">
                    <Box bg="background.800" p="5" borderRadius="4px" maxWidth="250px">
                        <HStack pb="5" spacing="4">
                            <Icon
                                as={oAuthProviders[session.provider].icon}
                                color={session.user.reputation as string}
                            />
                            <Heading as="h4" size="md">
                                {oAuthProviders[session.provider].title} {capitalize(session.user.reputation as string)}
                            </Heading>
                        </HStack>

                        {_hasJoined && <Text mb="5">You have already joined this group.</Text>}

                        <Button
                            onClick={() => join()}
                            colorScheme="background"
                            size="sm"
                            disabled={!_identityCommitment || _hasJoined}
                            isFullWidth
                        >
                            Join
                        </Button>
                    </Box>

                    <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                        <Heading as="h4" size="md" pl="6" py="2">
                            Groups
                        </Heading>
                        <Divider />
                        <Table variant="unstyled">
                            <Thead>
                                <Tr>
                                    <Th>Name</Th>
                                    <Th isNumeric>Members</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>
                                        <HStack>
                                            <Icon as={oAuthProviders[session.provider].icon} color="gold" />
                                            <Text>Gold</Text>
                                        </HStack>
                                    </Td>
                                    <Td isNumeric>{oAuthProviders[session.provider].groupSizes.gold}</Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        <HStack>
                                            <Icon as={oAuthProviders[session.provider].icon} color="silver" />
                                            <Text>Silver</Text>
                                        </HStack>
                                    </Td>
                                    <Td isNumeric>{oAuthProviders[session.provider].groupSizes.silver}</Td>
                                </Tr>
                                <Tr>
                                    <Td>
                                        <HStack>
                                            <Icon as={oAuthProviders[session.provider].icon} color="bronze" />
                                            <Text>Bronze</Text>
                                        </HStack>
                                    </Td>
                                    <Td isNumeric>{oAuthProviders[session.provider].groupSizes.bronze}</Td>
                                </Tr>
                            </Tbody>
                        </Table>
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
            ) : (
                <>
                    <HStack justify="space-between" my="6">
                        <InputGroup maxWidth="250px">
                            <InputLeftElement pointerEvents="none">
                                <GoSearch color="gray" />
                            </InputLeftElement>
                            <Input
                                colorScheme="primary"
                                placeholder="Search"
                                value={_searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                            />
                        </InputGroup>

                        <Select
                            value={_sortingValue}
                            onChange={(event) => setSortingValue(event.target.value)}
                            maxWidth="250px"
                        >
                            <option value="1">Most members</option>
                            <option value="2">A-Z</option>
                            <option value="3">Z-A</option>
                        </Select>
                    </HStack>

                    {_oAuthProviders ? (
                        <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                            {_oAuthProviders
                                .sort(sortCb)
                                .filter(filterCb)
                                .map((p, i) => (
                                    <GroupBox
                                        key={i.toString()}
                                        title={p.title}
                                        icon={p.icon}
                                        content={
                                            <GroupBoxOAuthContent
                                                icon={p.icon}
                                                goldGroupSize={p.groupSizes.gold}
                                                silverGroupSize={p.groupSizes.silver}
                                                bronzeGroupSize={p.groupSizes.bronze}
                                            />
                                        }
                                        actionText="Authorize"
                                        actionFunction={() => selectOAuthProvider(p.provider)}
                                        disabled={!_account}
                                    />
                                ))}
                        </SimpleGrid>
                    ) : (
                        <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                            {Object.values(oAuthProviders).map((_p, i) => (
                                <Skeleton
                                    key={i.toString()}
                                    startColor="background.800"
                                    endColor="background.700"
                                    borderRadius="4px"
                                    height="318px"
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </>
            )}

            <AlertDialog
                title="Authorize Interep to connect?"
                message={`Interep wants to connect with the last ${capitalize(
                    _oAuthProvider
                )} account you logged into. Approving this message will open a new window.`}
                isOpen={isOpen}
                onClose={onClose}
                actions={
                    <Button colorScheme="primary" isFullWidth onClick={() => signIn()}>
                        Approve
                    </Button>
                }
            />
        </Container>
    )
}
