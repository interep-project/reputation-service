import { Button, Container, HStack, Image, Tooltip, useClipboard } from "@chakra-ui/react"
import React, { useContext } from "react"
import { isBrowser } from "react-device-detect"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import { shortenAddress } from "src/utils/frontend"

export default function NavBar(): JSX.Element {
    const { _account, connect } = useContext(EthereumWalletContext)
    const { hasCopied, onCopy } = useClipboard(_account || "")
    // const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Container
            zIndex="1"
            // bg={colorMode === "light" ? "white" : "background.700"}
            position="fixed"
            pt="30px"
            pb="20px"
            px="80px"
            maxW="container.xl"
        >
            <HStack justify="space-between" align="center">
                <Image src="./logo.svg" alt="Interep logo" h={10} />
                {isBrowser && _account ? (
                    <Tooltip label={hasCopied ? "Copied!" : "Copy"} closeOnClick={false} hasArrow>
                        <Button onClick={onCopy} onMouseDown={(e) => e.preventDefault()} autoFocus={false}>
                            {shortenAddress(_account)}
                        </Button>
                    </Tooltip>
                ) : (
                    <Button colorScheme="primary" onClick={() => connect()}>
                        Connect Wallet
                    </Button>
                )}
                {/*
                    <IconButton
                        onClick={toggleColorMode}
                        aria-label="Change theme"
                        icon={colorMode === "dark" ? <FaMoon /> : <FaSun />}
                    />
                    */}
            </HStack>
        </Container>
    )
}
