import { Button, Container, HStack, IconButton, Text, Tooltip, useClipboard, useColorMode } from "@chakra-ui/react"
import React, { useContext } from "react"
import { isBrowser } from "react-device-detect"
import { FaMoon, FaSun } from "react-icons/fa"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import { shortenAddress } from "src/utils/frontend"

export default function NavBar(): JSX.Element {
    const { _account, connect } = useContext(EthereumWalletContext)
    const { hasCopied, onCopy } = useClipboard(_account || "")
    const { colorMode, toggleColorMode } = useColorMode()

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
                    Interep
                </Text>
                <HStack>
                    {isBrowser && _account ? (
                        <Tooltip label="Copied!" isOpen={hasCopied}>
                            <Button onClick={onCopy}>{shortenAddress(_account)}</Button>
                        </Tooltip>
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
