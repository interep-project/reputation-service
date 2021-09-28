import { FaGithub } from "react-icons/fa"
import React from "react"
import { Container, Link, Icon, Text, HStack, Box, useColorMode } from "@chakra-ui/react"

export default function Footer(): JSX.Element {
    const { colorMode } = useColorMode()

    return (
        <Box bg={colorMode === "light" ? "gray.200" : "background.800"} w="100%">
            <Container my="15px" px="80px" maxW="container.xl">
                <HStack justify="space-between">
                    <Text>© InterRep - 2021</Text>
                    <Link href="https://github.com/InterRep" isExternal>
                        <Icon boxSize="24px" as={FaGithub} />
                    </Link>
                </HStack>
            </Container>
        </Box>
    )
}
