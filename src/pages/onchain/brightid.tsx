import { Container, Box, Heading } from "@chakra-ui/react"

import React from "react"

export default function BrightIdPage(): JSX.Element {
    return (
        <>
            <Container flex="1" mb="80px" mt="180px" px="80px" maxW="container.lg">
                <Box bg="white" w="100%" p={4} color="black" alignItems="center" display="flex" flexDirection="column">
                    <Heading as="h3" size="lg">
                        Connect with BrightId
                    </Heading>
                    <Box>QR</Box>
                </Box>
            </Container>
        </>
    )
}
