import { Box, Container, HStack } from "@chakra-ui/react"
import { useSession } from "next-auth/client"
import React from "react"
import SideBar from "./SideBar"

type Parameters = {
    children: JSX.Element
}

export default function Page({ children }: Parameters): JSX.Element {
    const [session] = useSession()

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
                {session && <SideBar session={session} />}
                <Box flex="1" py="10px" pl={session ? "30px" : "0"} borderLeftWidth={session ? "4px" : "0"}>
                    {children}
                </Box>
            </HStack>
        </Container>
    )
}
