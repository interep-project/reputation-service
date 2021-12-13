import { Button, Heading, Input, InputGroup, InputRightElement, Text, useColorMode, VStack } from "@chakra-ui/react"
import { OAuthProvider } from "@interrep/reputation"
import React, { useState } from "react"
import { getReputation } from "src/utils/frontend/api"

export default function TwitterReputation(): JSX.Element {
    const { colorMode } = useColorMode()
    const [_twitterUsername, setTwitterUsername] = useState<string>("")
    const [_twitterReputation, setTwitterReputation] = useState<any>()
    const [_isLoading, setIsLoading] = useState(false)

    async function calculateReputation(): Promise<void> {
        if (!_twitterUsername) return

        setIsLoading(true)

        const reputation = await getReputation({
            provider: OAuthProvider.TWITTER,
            username: _twitterUsername
        })

        if (reputation) {
            setTwitterReputation(reputation)
        }

        setIsLoading(false)
    }

    return (
        <>
            <Heading as="h2" size="xl">
                Twitter Reputation Service
            </Heading>

            <Text mt="10px">Enter a twitter username to check if a user is reputable.</Text>

            <InputGroup mt="30px" size="md">
                <Input
                    pr="4.5rem"
                    placeholder="Username"
                    value={_twitterUsername}
                    onChange={(event) => setTwitterUsername(event.target.value)}
                    variant="flushed"
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => calculateReputation()} isLoading={_isLoading}>
                        Check
                    </Button>
                </InputRightElement>
            </InputGroup>

            {_twitterReputation && (
                <VStack mt="30px">
                    <Heading as="h5" size="sm">
                        Reputation: {_twitterReputation.reputation}
                    </Heading>

                    <VStack
                        p="16px"
                        background={colorMode === "light" ? "gray.100" : "whiteAlpha.100"}
                        borderRadius="2xl"
                    >
                        <Text>Bot Score</Text>
                        <Heading as="h4" size="md">
                            {_twitterReputation.parameters.botometerOverallScore}
                            /5
                        </Heading>
                    </VStack>
                </VStack>
            )}
        </>
    )
}
