import { Button, Divider, HStack, Icon, Text, Tooltip, useColorMode, VStack } from "@chakra-ui/react"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { Session } from "next-auth"
import { signOut } from "next-auth/client"
import React, { useCallback } from "react"
import { BiAward } from "react-icons/bi"
import { FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { capitalize } from "src/utils/common"

type Properties = {
    session?: Session | null
}

export default function SideBar({ session }: Properties): JSX.Element {
    const { colorMode } = useColorMode()

    const getReputationColor = useCallback(
        (reputation: ReputationLevel) => {
            if (typeof reputation === "string" && reputation !== ReputationLevel.NOT_SUFFICIENT) {
                return `${reputation.toLowerCase()}.${colorMode === "dark" ? "200" : "700"}`
            }

            return `red.${colorMode === "dark" ? "200" : "700"}`
        },
        [colorMode]
    )

    return (
        <VStack align="left" divider={<Divider />} py="15px" pr="30px" spacing="4">
            {session && (
                <VStack align="left" spacing="3">
                    <Text fontWeight="extrabold" fontSize="xl">
                        Web2
                    </Text>
                    <HStack spacing="2">
                        {session.provider === OAuthProvider.TWITTER ? (
                            <Icon boxSize="26px" as={FaTwitter} />
                        ) : session.provider === OAuthProvider.GITHUB ? (
                            <Icon boxSize="26px" as={FaGithub} />
                        ) : (
                            <Icon boxSize="26px" as={FaRedditAlien} />
                        )}
                        <Text fontSize="md">{capitalize(session.provider)}</Text>
                    </HStack>
                    <Text fontSize="md">Username: {session.user.username as string}</Text>
                    {session.user?.reputation && (
                        <HStack spacing="1">
                            <Text fontSize="md">Reputation: </Text>
                            <Tooltip
                                label={`Your ${capitalize(session.provider)} reputation is: ${
                                    session.user.reputation
                                }.`}
                                placement="right-start"
                            >
                                <span>
                                    <Icon
                                        boxSize="24px"
                                        color={getReputationColor(session.user.reputation as ReputationLevel)}
                                        as={BiAward}
                                    />
                                </span>
                            </Tooltip>
                        </HStack>
                    )}
                </VStack>
            )}

            {session && (
                <HStack>
                    <Button onClick={() => signOut()} size="md" colorScheme="primary" variant="link">
                        Sign out
                    </Button>
                </HStack>
            )}
        </VStack>
    )
}
