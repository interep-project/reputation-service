import {
    Container,
    Heading,
    HStack,
    Icon,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Skeleton,
    Stack,
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
import { getReputationCriteria, OAuthProvider, ReputationCriteria } from "@interep/reputation"
import { Step, Steps } from "chakra-ui-steps"
import { GetServerSideProps } from "next"
import { signIn as _signIn } from "next-auth/client"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { IconType } from "react-icons"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { GoSearch } from "react-icons/go"
import { GroupBox, GroupBoxButton, GroupBoxHeader, GroupBoxOAuthContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"
import { groupBy, mapReputationRule } from "src/utils/frontend"

const oAuthIcons: Record<string, IconType> = {
    twitter: FaTwitter,
    github: FaGithub,
    reddit: FaRedditAlien
}

export default function OAuthProvidersPage(): JSX.Element {
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
    const { _account } = useContext(EthereumWalletContext)
    const [_reputationCriteria, setReputationCriteria] = useState<ReputationCriteria>()
    const [_oAuthProviders, setOAuthProviders] = useState<[string, Group[]][]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("2")
    const { getGroups } = useGroups()

    useEffect(() => {
        ;(async () => {
            const groups = await getGroups()

            if (groups) {
                setOAuthProviders(groupBy(groups, "provider", Object.values(OAuthProvider)))
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function getTotalGroupSizes(provider: any): number {
        const groups: Group[] = provider[1]

        return groups.reduce((t, c) => t + c.size, 0)
    }

    const sortCb = useCallback(
        (oAuthProviderA: any, oAuthProviderB: any) => {
            switch (_sortingValue) {
                case "2":
                    return oAuthProviderA[0].localeCompare(oAuthProviderB[0])
                case "3":
                    return oAuthProviderA[0].localeCompare(oAuthProviderA[0])
                case "1":
                default:
                    return getTotalGroupSizes(oAuthProviderB) - getTotalGroupSizes(oAuthProviderA)
            }
        },
        [_sortingValue]
    )

    const filterCb = useCallback(
        (oAuthProvider: any) => {
            const name = oAuthProvider[0]

            return !_searchValue || name.includes(_searchValue.toLowerCase())
        },
        [_searchValue]
    )

    function openModal(oAuthProvider: OAuthProvider) {
        const reputationCriteria = getReputationCriteria(oAuthProvider)

        setReputationCriteria(reputationCriteria)

        onModalOpen()
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <Stack direction={["column", "column", "row"]} spacing="10">
                <VStack flex="1" align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Anonymously use your social reputation on-chain
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        To join Social network groups you will need to authorize each provider individually to share
                        your credentials with Interep.
                    </Text>
                </VStack>
                <HStack flex="1" justify="center">
                    <Image src="./oauth-illustration.png" alt="Social network illustration" />
                </HStack>
            </Stack>

            <Steps activeStep={0} colorScheme="background" size="sm" my="12">
                <Step label="Authorize provider" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join social network group" />
            </Steps>

            <HStack justify="space-between" mb="10">
                <InputGroup maxWidth="250px">
                    <InputLeftElement pointerEvents="none">
                        <GoSearch color="gray" />
                    </InputLeftElement>
                    <Input
                        colorScheme="primary"
                        focusBorderColor="primary.500"
                        placeholder="Search"
                        value={_searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </InputGroup>

                <Select
                    value={_sortingValue}
                    onChange={(event) => setSortingValue(event.target.value)}
                    maxWidth="250px"
                    focusBorderColor="primary.500"
                >
                    <option value="1">Most members</option>
                    <option value="2">A-Z</option>
                    <option value="3">Z-A</option>
                </Select>
            </HStack>

            {_oAuthProviders ? (
                <SimpleGrid minChildWidth="325px" spacing={5}>
                    {_oAuthProviders
                        .sort(sortCb)
                        .filter(filterCb)
                        .map((p, i) => (
                            <GroupBox key={i.toString()}>
                                <GroupBoxHeader title={capitalize(p[0])} icon={oAuthIcons[p[0]]} />
                                <GroupBoxOAuthContent
                                    onInfoClick={() => openModal(p[0] as OAuthProvider)}
                                    icon={oAuthIcons[p[0]]}
                                    groups={p[1]}
                                />
                                <GroupBoxButton
                                    alertTitle="Confirm authorization"
                                    alertMessage={`Interep wants to connect with the last ${capitalize(
                                        p[0]
                                    )} account you logged into. Approving this message will open a new window.`}
                                    onClick={() => _signIn(p[0])}
                                    disabled={!_account}
                                >
                                    Authorize
                                </GroupBoxButton>
                            </GroupBox>
                        ))}
                </SimpleGrid>
            ) : (
                <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                    {Object.values(oAuthIcons).map((_p, i) => (
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

            {_reputationCriteria && (
                <Modal isOpen={isModalOpen} onClose={onModalClose} size="3xl" isCentered>
                    <ModalOverlay />

                    <ModalContent>
                        <ModalHeader>{capitalize(_reputationCriteria.provider)} group qualifications</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb="6">
                            <Table variant="grid" colorScheme="background">
                                <Thead>
                                    <Tr>
                                        <Th>Group</Th>
                                        {_reputationCriteria.parameters.map((parameter, i) => (
                                            <Th key={i.toString()}>{parameter.name.replace(/([A-Z])/g, " $1")}</Th>
                                        ))}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {_reputationCriteria.reputationLevels.map((reputation, i) => (
                                        <Tr key={i.toString()}>
                                            <Td>
                                                <HStack spacing="4">
                                                    <Icon
                                                        as={oAuthIcons[_reputationCriteria.provider]}
                                                        color={`${reputation.name}.400`}
                                                    />
                                                    <Text>{capitalize(reputation.name)}</Text>
                                                </HStack>
                                            </Td>
                                            {reputation.rules.map((rule, i) => (
                                                <Td key={i.toString()}>{mapReputationRule(rule)}</Td>
                                            ))}
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            props: {}
        }
    }

    return {
        redirect: {
            destination: "/oauth",
            permanent: false
        }
    }
}
