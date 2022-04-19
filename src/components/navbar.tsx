import { Box, Button, ButtonGroup, Container, HStack, IconButton, Image, Tooltip, useClipboard } from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React, { useContext, useEffect, useState } from "react"
import { isBrowser } from "react-device-detect"
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
            case "/oauth":
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
                    <Button
                        onClick={() => router.push("/")}
                        variant="link"
                        color={router.route === "/" || router.route === "/oauth" ? "inherit" : "gray"}
                    >
                        Social Network
                    </Button>
                    <Button
                        onClick={() => router.push("/poap")}
                        variant="link"
                        color={router.route === "/poap" ? "inherit" : "gray"}
                    >
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
                                        colorScheme={!_provider || _identityCommitment ? "gray" : "primary"}
                                        variant={!_provider || _identityCommitment ? "outline" : "solid"}
                                        aria-label="Semaphore ID"
                                        borderRightWidth="0"
                                        icon={
                                            <Image
                                                boxSize="24px"
                                                src={
                                                    !_identityCommitment
                                                        ? "./semaphore-icon.svg"
                                                        : "./semaphore-icon-success.svg"
                                                }
                                            />
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
                                    <Button variant="outline" onClick={onCopy} onMouseDown={(e) => e.preventDefault()}>
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
