import { Box, Container, HStack } from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import React, { useContext } from "react"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import SideBar from "./SideBar"

type Parameters = {
    children: JSX.Element
}

export default function Page({ children }: Parameters): JSX.Element {
    const [session] = useSession()
    const { _poapGroupNames } = useContext(EthereumWalletContext) as EthereumWalletContextType

    return (
        <Container
            flex="1"
            mb="80px"
            mt="180px"
            px="80px"
            maxW={session || !!_poapGroupNames.length ? "container.lg" : "container.md"}
            display="flex"
        >
            <HStack flex="1" align="start">
                {(session || !!_poapGroupNames.length) && (
                    <SideBar session={session} poapGroupNames={_poapGroupNames} />
                )}
                <Box
                    flex="1"
                    py="10px"
                    pl={session || !!_poapGroupNames.length ? "30px" : "0"}
                    borderLeftWidth={session || !!_poapGroupNames.length ? "4px" : "0"}
                >
                    {children}
                </Box>
            </HStack>
        </Container>
    )
}
