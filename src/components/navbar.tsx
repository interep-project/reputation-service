import { Box, Button, ButtonGroup, Container, HStack, IconButton, Image, Tooltip, useClipboard } from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useState } from "react"
import { isBrowser } from "react-device-detect"
import { FaCheck } from "react-icons/fa"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import { Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"
import { shortenAddress } from "src/utils/frontend"

export default function NavBar(): JSX.Element {
    const router = useRouter()
    const [session] = useSession()
    const {
        _account,
        _identityCommitment,
        connect,
        generateIdentityCommitment,
        retrieveIdentityCommitment,
        setIdentityCommitment
    } = useContext(EthereumWalletContext)
    const [_provider, setProvider] = useState<Provider>()
    const { hasCopied, onCopy } = useClipboard(_account || "")
    // const { colorMode, toggleColorMode } = useColorMode()

    useEffect(() => {
        if (_account && _provider) {
            retrieveIdentityCommitment(_provider)
        } else {
            setIdentityCommitment(undefined)
        }
    }, [_account, _provider, retrieveIdentityCommitment, setIdentityCommitment])

    useEffect(() => {
        switch (router.route) {
            case "/poap":
                setProvider("poap")
                break
            case "/":
                if (session) {
                    setProvider(session.provider)
                } else {
                    setProvider(undefined)
                }
                break
            default:
                setProvider(undefined)
        }
    }, [router, session])

    return (
        <Container zIndex="1" background="#121212" position="fixed" pt="30px" pb="20px" px="80px" maxW="container.xl">
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
                            <ButtonGroup isAttached>
                                <Tooltip
                                    label={
                                        _identityCommitment && _provider
                                            ? `${capitalize(_provider)} Semaphore ID active!`
                                            : "Generate Semaphore ID"
                                    }
                                    hasArrow
                                >
                                    <IconButton
                                        colorScheme={_identityCommitment ? "gray" : "primary"}
                                        aria-label="Semaphore ID"
                                        borderRightWidth={_identityCommitment ? 1 : 0}
                                        icon={
                                            _identityCommitment ? (
                                                <FaCheck color="green" />
                                            ) : (
                                                <Image boxSize="24px" src="./semaphore-icon.png" />
                                            )
                                        }
                                        onClick={
                                            !_identityCommitment
                                                ? () => generateIdentityCommitment(_provider as Provider)
                                                : undefined
                                        }
                                        onMouseDown={(e) => e.preventDefault()}
                                        disabled={!_provider}
                                    />
                                </Tooltip>

                                <Tooltip label={hasCopied ? "Copied!" : "Copy"} closeOnClick={false} hasArrow>
                                    <Button onClick={onCopy} onMouseDown={(e) => e.preventDefault()}>
                                        {shortenAddress(_account)}
                                    </Button>
                                </Tooltip>
                            </ButtonGroup>
                        ) : (
                            <Button colorScheme="primary" onClick={() => connect()}>
                                Connect Wallet
                            </Button>
                        )}
                    </Box>

                    {
                        // <IconButton
                        // onClick={toggleColorMode}
                        // aria-label="Change theme"
                        // icon={colorMode === "dark" ? <FaMoon /> : <FaSun />}
                        // />
                    }
                </HStack>
            </HStack>
        </Container>
    )
}
