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
    const { _address } = useContext(EthereumWalletContext) as EthereumWalletContextType

    return (
        <Container
            flex="1"
            mb="80px"
            mt="180px"
            px="80px"
            maxW={session ? "container.lg" : "container.md"}
            display="flex"
        >
            <HStack flex="1" align="start">
                {(session || _address) && <SideBar session={session} address={_address} />}
                <Box
                    flex="1"
                    py="10px"
                    pl={session || _address ? "30px" : "0"}
                    borderLeftWidth={session || _address ? "4px" : "0"}
                >
                    {children}
                </Box>
            </HStack>
        </Container>
    )
}
