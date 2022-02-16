import { FaGithub, FaMedium, FaTelegram, FaTwitter } from "react-icons/fa"
import React from "react"
import { Container, Link, Icon, Text, HStack, Box, useColorMode } from "@chakra-ui/react"

export default function Footer(): JSX.Element {
    const { colorMode } = useColorMode()

    return (
        <Box bg={colorMode === "light" ? "gray.200" : "background.800"} w="100%">
            <Container my="15px" px="80px" maxW="container.xl">
                <HStack justify="space-between">
                    <Text>Copyright © 2021 Interep</Text>

                    <HStack spacing={4}>
                        <Link fontWeight="bold" href="https://docs.interep.link" isExternal>
                            Docs
                        </Link>
                        <Text>|</Text>
                        <Link href="https://medium.com/privacy-scaling-explorations" isExternal>
                            <Icon boxSize="20px" as={FaMedium} />
                        </Link>
                        <Link href="https://twitter.com/PrivacyScaling" isExternal>
                            <Icon boxSize="20px" as={FaTwitter} />
                        </Link>
                        <Link href="https://t.me/interrep" isExternal>
                            <Icon boxSize="20px" as={FaTelegram} />
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
