import { Button, Container, HStack, IconButton, Text, Tooltip, useClipboard, useColorMode } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { providers } from "ethers"
import React, { useEffect } from "react"
import { isBrowser } from "react-device-detect"
import { FaMoon, FaSun } from "react-icons/fa"
import { injectedConnector, shortenAddress } from "src/utils/frontend"

export default function NavBar(): JSX.Element {
    const { activate, account } = useWeb3React<providers.Web3Provider>()
    const { hasCopied, onCopy } = useClipboard(account as string)
    const { colorMode, toggleColorMode } = useColorMode()

    useEffect(() => {
        ;(async () => {
            if (await injectedConnector.isAuthorized()) {
                await activate(injectedConnector)
            }
        })()
    }, [activate])

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
                <Text fontSize="2xl" mr="16px">
                    InterRep
                </Text>
                <HStack>
                    {isBrowser && account ? (
                        <Tooltip label="Copied!" isOpen={hasCopied}>
                            <Button onClick={onCopy}>{shortenAddress(account)}</Button>
                        </Tooltip>
                    ) : (
                        <Button onClick={() => activate(injectedConnector)}>Connect Your Wallet</Button>
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
