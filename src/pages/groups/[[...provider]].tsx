import {
    Heading,
    Icon,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Tooltip,
    useColorMode,
    VStack
} from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React, { useContext } from "react"
import { FaInfoCircle } from "react-icons/fa"
import PoapGroups from "src/components/PoapGroups"
import TelegramGroups from "src/components/TelegramGroups"
import EmailGroups from "src/components/EmailGroups"
import OAuthGroups from "src/components/OAuthGroups"
import { currentNetwork } from "src/config"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import capitalize from "src/utils/common/capitalize"

export default function Groups(): JSX.Element {
    const [session] = useSession()
    const { colorMode } = useColorMode()
    const { _address, _networkId, _poapGroupNames } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const router = useRouter()
    const parameters = router.query.provider as string[]

    function walletIsConnected(networkId?: number, address?: string): boolean {
        return currentNetwork.chainId === networkId && !!address
    }

    function isTelegramMagicLink(parameters: string[]): boolean {
        return Array.isArray(parameters) && parameters.length === 3 && parameters[0] === "telegram"
    }

    function isEmailMagicLink(parameters: string[]): boolean {
        return Array.isArray(parameters) && parameters.length === 4 && parameters[0] === "email"
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
            ) : !session && _poapGroupNames.length === 0 && !isTelegramMagicLink(parameters)  && !isEmailMagicLink(parameters)? (
                <VStack h="300px" align="center" justify="center">
                    <Text fontSize="lg">Please, sign in with one of our supported providers!</Text>
                </VStack>
            ) : (
                <Tabs mt="20px" variant="solid-rounded">
                    <TabList>
                        {isTelegramMagicLink(parameters) && <Tab mr="10px">Telegram</Tab>}
                        {isEmailMagicLink(parameters) && <Tab mr="10px">Email</Tab>}
                        {session && <Tab mr="10px">{capitalize(session.provider)}</Tab>}
                        {_poapGroupNames.length !== 0 && <Tab>POAP</Tab>}
                    </TabList>
                    <TabPanels>
                        {isTelegramMagicLink(parameters) && (
                            <TabPanel>
                                <TelegramGroups userId={parameters[1]} groupId={parameters[2]} />
                            </TabPanel>
                        )}
                        {isEmailMagicLink(parameters) && (
                            <TabPanel>
                                <EmailGroups userId={parameters[2]} userToken={parameters[1]} groupId={parameters[3]} />
                            </TabPanel>
                        )}
                        {session && (
                            <TabPanel>
                                <OAuthGroups />
                            </TabPanel>
                        )}
                        {_poapGroupNames.length !== 0 && (
                            <TabPanel>
                                <PoapGroups />
                            </TabPanel>
                        )}
                    </TabPanels>
                </Tabs>
            )}
        </>
    )
}
