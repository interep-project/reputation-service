import { FaGithub } from "react-icons/fa"
import React from "react"
import { Container, Link, Icon, Text, HStack, Box } from "@chakra-ui/react"

export default function Footer(): JSX.Element {
    return (
        <Box bg="background.800" w="100%">
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
