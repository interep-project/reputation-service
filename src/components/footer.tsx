import { Box, Container, HStack, Icon, Link, Text, useColorMode } from "@chakra-ui/react"
import React from "react"
import { FaDiscord, FaGithub } from "react-icons/fa"

export default function Footer(): JSX.Element {
    const { colorMode } = useColorMode()

    return (
        <Box bg={colorMode === "light" ? "gray.200" : "background.800"} w="100%">
            <Container my="15px" px="80px" maxW="container.xl">
                <HStack justify="space-between">
                    <HStack spacing="4">
                        <Text>Copyright © 2021 Interep</Text>
                        <Text>|</Text>
                        <Link fontWeight="bold" href="https://interep.link" isExternal>
                            About
                        </Link>
                        <Link fontWeight="bold" href="https://interep.link/docs" isExternal>
                            Docs
                        </Link>
                    </HStack>

                    <HStack spacing={4}>
                        <Link href="https://discord.gg/Tp9He7qws4" isExternal>
                            <Icon boxSize="20px" as={FaDiscord} />
                        </Link>
                        <Link href="https://github.com/interep-project" isExternal>
                            <Icon boxSize="20px" as={FaGithub} />
                        </Link>
                    </HStack>
                </HStack>
            </Container>
        </Box>
    )
}
