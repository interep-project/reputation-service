import {
    Button,
    IconButton,
    ButtonGroup,
    Container,
    HStack,
    Text,
    Tooltip,
    useClipboard,
    useColorMode
} from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/dist/client/router"
import React, { useCallback, useContext } from "react"
import { isBrowser } from "react-device-detect"
import { FaSun, FaMoon } from "react-icons/fa"
import { currentNetwork } from "src/config"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import getNetworkFullName from "src/utils/common/getNetworkFullName"
import shortenAddress from "src/utils/frontend/shortenAddress"

export default function NavBar(): JSX.Element {
    const router = useRouter()
    const parameters = router.query.provider as string[]
    const [session] = useSession()
    const { connect, check, _networkId, _address, _poapGroupNames } = useContext(
        EthereumWalletContext
    ) as EthereumWalletContextType
    const { hasCopied, onCopy } = useClipboard(_address as string)

    const { colorMode, toggleColorMode } = useColorMode()

    const appIsReady = useCallback(
        () => !!(session && session.user.reputation && currentNetwork.chainId === _networkId && _address),
        [session, _networkId, _address]
    )

    function isTelegramMagicLink(parameters: string[]): boolean {
        return Array.isArray(parameters) && parameters.length === 3 && parameters[0] === "telegram"
    }

    return (
        <Container
            zIndex="1"
            bg={colorMode === "light" ? "white" : "background.700"}
            position="fixed"
            pt="60px"
            pb="20px"
            px="80px"
            maxW="container.xl"
        >
            <HStack justify="space-between">
                <HStack>
                    <Text fontSize="2xl" mr="16px">
                        InterRep
                    </Text>
                    <ButtonGroup variant="nav" spacing="2">
                        <Button onClick={() => router.push("/")} isActive={router.route === "/"}>
                            Web2 Login
                        </Button>
                        <Button
                            onClick={() => router.push("/groups")}
                            isActive={router.route === "/groups/[[...provider]]"}
                            isDisabled={
                                !_address ||
                                (!appIsReady() && !_poapGroupNames.length && !isTelegramMagicLink(parameters))
                            }
                        >
                            Groups
                        </Button>
                        <Button
                            onClick={() => router.push("/badges")}
                            isActive={router.route === "/badges"}
                            isDisabled={!appIsReady()}
                        >
                            Badges
                        </Button>
                    </ButtonGroup>
                </HStack>
                <HStack>
                    {isBrowser && _address && _networkId ? (
                        <>
                            <Text
                                color={colorMode === "light" ? "secondary.700" : "secondary.200"}
                                fontWeight="bold"
                                fontSize="lg"
                            >
                                {_networkId && getNetworkFullName(_networkId)}
                            </Text>
                            {_networkId === currentNetwork.chainId ? (
                                <Tooltip label="Copied!" isOpen={hasCopied}>
                                    <Button onClick={onCopy}>{shortenAddress(_address)}</Button>
                                </Tooltip>
                            ) : (
                                <Button onClick={() => check()}>Switch Network</Button>
                            )}
                        </>
                    ) : (
                        <Button onClick={() => connect()}>Connect Your Wallet</Button>
                    )}
                    <IconButton
                        onClick={toggleColorMode}
                        aria-label="Change theme"
                        icon={colorMode === "dark" ? <FaMoon /> : <FaSun />}
                    />
                </HStack>
            </HStack>
        </Container>
    )
}
