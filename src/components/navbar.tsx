import {
    Box,
    Button,
    Container,
    HStack,
    IconButton,
    Image,
    Tooltip,
    useClipboard,
    useColorMode
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import React, { useContext } from "react"
import { isBrowser } from "react-device-detect"
import { FaMoon, FaSun } from "react-icons/fa"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import { shortenAddress } from "src/utils/frontend"

export default function NavBar(): JSX.Element {
    const router = useRouter()
    const { _account, connect } = useContext(EthereumWalletContext)
    const { hasCopied, onCopy } = useClipboard(_account || "")
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <Container zIndex="1" position="fixed" pt="30px" pb="20px" px="80px" maxW="container.xl">
            <HStack justify="space-between">
                <Image src="./logo.svg" alt="Interep logo" h={10} />

                <HStack spacing="6">
                    <Button onClick={() => router.push("/")} variant="link">
                        Social Network
                    </Button>
                    <Button onClick={() => router.push("/poap")} variant="link">
                        POAP
                    </Button>

                    <Box pl="8">
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
                    </Box>

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
