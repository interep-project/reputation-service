import {
    Button,
    Container,
    Heading,
    SimpleGrid,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useDisclosure
} from "@chakra-ui/react"
import { OAuthProvider } from "@interep/reputation"
import { GetServerSideProps } from "next"
import { signIn as _signIn } from "next-auth/client"
import React, { useContext, useState } from "react"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import AlertDialog from "src/components/AlertDialog"
import GroupBox from "src/components/GroupBox"
import GroupBoxOAuthContent from "src/components/GroupBoxOAuthContent"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import { capitalize } from "src/utils/common"

export default function Providers(): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { _account } = useContext(EthereumWalletContext)
    const [_oAuthProvider, setOAuthProvider] = useState<string>("")

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
                Anonymously join groups using your credentials from social networks.
            </Heading>

            <Text color="background.400" mb="30px" fontSize="lg">
                To join Social network groups you will need to authorize each provider individuallly to share your
                credentials with Interep. Groups can be left at any time.
            </Text>

            <Tabs colorScheme="gray">
                <TabList>
                    <Tab fontSize="lg">Social Network</Tab>
                    <Tab fontSize="lg">POAP</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Text mb="30px">To join a social network group, first authorize the provider.</Text>

                        <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                            <GroupBox
                                title="Twitter"
                                icon={<FaTwitter />}
                                content={
                                    <GroupBoxOAuthContent goldMembers={113} silverMembers={523} bronzeMembers={23} />
                                }
                                actionText="Authorize"
                                actionFunction={() => selectOAuthProvider(OAuthProvider.TWITTER)}
                                disabled={!_account}
                            />
                            <GroupBox
                                title="Github"
                                icon={<FaGithub />}
                                content={
                                    <GroupBoxOAuthContent goldMembers={113} silverMembers={523} bronzeMembers={23} />
                                }
                                actionText="Authorize"
                                actionFunction={() => selectOAuthProvider(OAuthProvider.GITHUB)}
                                disabled={!_account}
                            />
                            <GroupBox
                                title="Reddit"
                                icon={<FaRedditAlien />}
                                content={
                                    <GroupBoxOAuthContent goldMembers={113} silverMembers={523} bronzeMembers={23} />
                                }
                                actionText="Authorize"
                                actionFunction={() => selectOAuthProvider(OAuthProvider.REDDIT)}
                                disabled={!_account}
                            />
                        </SimpleGrid>
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
