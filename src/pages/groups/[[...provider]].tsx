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
import Web2Groups from "src/components/Web2Groups"
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
            ) : !session && _poapGroupNames.length === 0 && !parameters ? (
                <VStack h="300px" align="center" justify="center">
                    <Text fontSize="lg">Please, sign in with one of our supported Web2 providers!</Text>
                </VStack>
            ) : (
                <Tabs mt="20px" variant="solid-rounded">
                    <TabList>
                        {parameters[0] === "telegram" && <Tab>Telegram</Tab>}
                        {session && <Tab mr="10px">{capitalize(session.web2Provider)}</Tab>}
                        {_poapGroupNames.length !== 0 && <Tab>POAP</Tab>}
                    </TabList>
                    <TabPanels>
                        {parameters[0] === "telegram" && (
                            <TabPanel>
                                <TelegramGroups userId={parameters[2]} groupId={parameters[3]} />
                            </TabPanel>
                        )}
                        {session && (
                            <TabPanel>
                                <Web2Groups />
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
