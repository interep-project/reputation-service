import {
    Button,
    Container,
    Divider,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Text,
    useDisclosure
} from "@chakra-ui/react"
import { OAuthProvider } from "@interep/reputation"
import { GetServerSideProps } from "next"
import { signIn as _signIn } from "next-auth/client"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { GoSearch } from "react-icons/go"
import AlertDialog from "src/components/AlertDialog"
import { GroupBox, GroupBoxOAuthContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { capitalize } from "src/utils/common"

const oAuthProviders: Record<OAuthProvider, any> = {
    twitter: {
        provider: OAuthProvider.TWITTER,
        title: "Twitter",
        icon: <FaTwitter />,
        groupSizes: {}
    },
    github: {
        provider: OAuthProvider.GITHUB,
        title: "Github",
        icon: <FaGithub />,
        groupSizes: {}
    },
    reddit: {
        provider: OAuthProvider.REDDIT,
        title: "Reddit",
        icon: <FaRedditAlien />,
        groupSizes: {}
    }
}

export default function OAuthProviders(): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { _account } = useContext(EthereumWalletContext)
    const [_oAuthProvider, setOAuthProvider] = useState<string>("")
    const [_oAuthProviders, setOAuthProviders] = useState<any[]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("1")

    const { getGroups } = useGroups()

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

    function getTotalGroupSizes(provider: any): number {
        const sizes = Object.values(provider.groupSizes) as number[]

        return sizes.reduce((t, c) => t + c, 0)
    }

    const sort = useCallback(
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

    function selectOAuthProvider(oAuthProvider: OAuthProvider) {
        setOAuthProvider(oAuthProvider)
        onOpen()
    }

    const signIn = useCallback(() => {
        _signIn(_oAuthProvider)
        onClose()
    }, [_oAuthProvider, onClose])

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.lg">
            <Heading as="h2" size="xl" mb="10px">
                Authenticate anonymously on-chain using off-chain reputation.
            </Heading>

            <Text color="background.400" fontSize="md">
                To join Social network groups you will need to authorize each provider individually to share your
                credentials with Interep. Groups can be left at any time.
            </Text>

            <Divider my="30px" />

            <HStack justify="space-between" my="30px">
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
                        .sort(sort)
                        .filter(
                            (group) => !_searchValue || group.title.toLowerCase().includes(_searchValue.toLowerCase())
                        )
                        .map((group, i) => (
                            <GroupBox
                                key={i.toString()}
                                title={group.title}
                                icon={group.icon}
                                content={
                                    <GroupBoxOAuthContent
                                        goldGroupSize={group.groupSizes.gold}
                                        silverGroupSize={group.groupSizes.silver}
                                        bronzeGroupSize={group.groupSizes.bronze}
                                    />
                                }
                                actionText="Authorize"
                                actionFunction={() => selectOAuthProvider(group.provider)}
                                disabled={!_account}
                            />
                        ))}
                </SimpleGrid>
            ) : (
                <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                    {Object.values(oAuthProviders).map(() => (
                        <Skeleton
                            startColor="background.800"
                            endColor="background.700"
                            borderRadius="4px"
                            height="318px"
                        />
                    ))}
                </SimpleGrid>
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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            props: {}
        }
    }

    return {
        redirect: {
            destination: "/groups",
            permanent: false
        }
    }
}
