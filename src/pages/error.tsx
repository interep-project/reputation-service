import { Container, Heading, HStack, Icon, Text, VStack } from "@chakra-ui/react"
import { useRouter } from "next/router"
import React from "react"
import { FaSadTear } from "react-icons/fa"
import { capitalize } from "src/utils/common"

export default function ErrorPage(): JSX.Element {
    const router = useRouter()
    const error = (router.query.error as string) || "server-error"

    return (
        <Container flex="1" mb="80px" mt="300px" px="80px" maxW="container.lg">
            <VStack align="center">
                <HStack>
                    <Heading as="h2" size="xl">
                        {capitalize(error).replaceAll("-", " ")}
                    </Heading>
                    <Icon boxSize="35px" as={FaSadTear} />
                </HStack>
                <Text color="background.400" fontSize="md" pt="3">
                    {error === "insufficient-reputation"
                        ? "Your reputation is not high enough. Try authenticating to another provider."
                        : "Unexpected error in the server. Please contact us!"}
                </Text>
            </VStack>
        </Container>
    )
}
