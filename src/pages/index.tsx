import {
    Button,
    Container,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure
} from "@chakra-ui/react"
import { getOAuthProviders, OAuthProvider } from "@interep/reputation"
import { GetServerSideProps } from "next"
import { signIn as _signIn } from "next-auth/client"
import React, { useContext, useEffect, useState } from "react"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { GoSearch } from "react-icons/go"
import AlertDialog from "src/components/AlertDialog"
import GroupBox from "src/components/GroupBox"
import GroupBoxOAuthContent from "src/components/GroupBoxOAuthContent"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { capitalize } from "src/utils/common"

const oAuthGroups: Record<OAuthProvider, any> = {
    twitter: {
        provider: OAuthProvider.TWITTER,
        title: "Twitter",
        icon: <FaTwitter />,
        members: {}
    },
    github: {
        provider: OAuthProvider.GITHUB,
        title: "Github",
        icon: <FaGithub />,
        members: {}
    },
    reddit: {
        provider: OAuthProvider.REDDIT,
        title: "Reddit",
        icon: <FaRedditAlien />,
        members: {}
    }
}

export default function Providers(): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { _account } = useContext(EthereumWalletContext)
    const [_oAuthProvider, setOAuthProvider] = useState<string>("")
    const [_oAuthGroups, setOAuthGroups] = useState<any[]>()
    const [_searchValue, setSearchValue] = useState<string>("")

    const { getGroups } = useGroups()

    useEffect(() => {
        ;(async () => {
            const groups = await getGroups()

            if (groups) {
                const oAuthProviders = getOAuthProviders()

                for (const group of groups) {
                    if (oAuthProviders.includes(group.provider as OAuthProvider)) {
                        oAuthGroups[group.provider as OAuthProvider].members[group.name] = group.size
                    }
                }

                setOAuthGroups(Object.values(oAuthGroups))
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function selectOAuthProvider(oAuthProvider: OAuthProvider) {
        setOAuthProvider(oAuthProvider)
        onOpen()
    }

    function signIn() {
        _signIn(_oAuthProvider)
        onClose()
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.lg">
            <Heading as="h2" mb="30px" size="xl">
                Authenticate anonymously on-chain using off-chain reputation.
            </Heading>

            <Text color="background.400" mb="30px" fontSize="lg">
                To join Social network groups you will need to authorize each provider individually to share your
                credentials with Interep. Groups can be left at any time.
            </Text>

            <Tabs colorScheme="gray">
                <TabList>
                    <Tab fontSize="lg">Social Network</Tab>
                    <Tab fontSize="lg">POAP</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <HStack mt="2" mb="8">
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
                        </HStack>

                        {_oAuthGroups && (
                            <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                                {_oAuthGroups
                                    .filter(
                                        (group) =>
                                            !_searchValue ||
                                            group.title.toLowerCase().includes(_searchValue.toLowerCase())
                                    )
                                    .map((group) => (
                                        <GroupBox
                                            title={group.title}
                                            icon={group.icon}
                                            content={
                                                <GroupBoxOAuthContent
                                                    goldMembers={group.members.gold}
                                                    silverMembers={group.members.silver}
                                                    bronzeMembers={group.members.bronze}
                                                />
                                            }
                                            actionText="Authorize"
                                            actionFunction={() => selectOAuthProvider(group.provider)}
                                            disabled={!_account}
                                        />
                                    ))}
                            </SimpleGrid>
                        )}
                    </TabPanel>
                    <TabPanel>
                        <p>TODO</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
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
