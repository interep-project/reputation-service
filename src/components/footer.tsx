import { Box, Container, HStack, Icon, Link, Text } from "@chakra-ui/react"
import React from "react"
import { FaDiscord, FaGithub } from "react-icons/fa"

export default function Footer(): JSX.Element {
    return (
        <Box bg="background.800" w="100%">
            <Container my="15px" px="80px" maxW="container.xl">
                <HStack justify="space-between">
                    <HStack spacing="4">
                        <Text color="background.300">© Interep</Text>
                        <Text color="background.300">|</Text>
                        <Link fontWeight="bold" href="https://interep.link" isExternal>
                            About
                        </Link>
                        <Link fontWeight="bold" href="https://docs.interep.link" isExternal>
                            Docs
                        </Link>
                    </HStack>

                    <HStack spacing={4}>
                        <Link href="https://appliedzkp.org/discord" h={5} isExternal>
                            <Icon as={FaDiscord} w={5} h={5} />
                        </Link>
                        <Link href="https://github.com/interep-project" h={5} isExternal>
                            <Icon as={FaGithub} w={5} h={5} />
                        </Link>
                    </HStack>
                </HStack>
            </Container>
        </Box>
    )
}
