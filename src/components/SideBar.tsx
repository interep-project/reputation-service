import { Button, HStack, Icon, Text, Tooltip, useColorMode, VStack } from "@chakra-ui/react"
import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { Session } from "next-auth"
import { signOut } from "next-auth/client"
import React, { useCallback } from "react"
import { FaGithub, FaRedditAlien, FaTwitter, FaAward } from "react-icons/fa"
import { capitalize } from "src/utils/frontend/capitalize"

type Properties = {
    session: Session
}

export default function SideBar({ session }: Properties): JSX.Element {
    const { colorMode } = useColorMode()

    const getReputationColor = useCallback(() => {
        const reputation = session.user?.reputation as string

        if (typeof reputation === "string" && reputation !== ReputationLevel.NOT_SUFFICIENT) {
            return `${reputation.toLowerCase()}.${colorMode === "dark" ? "200" : "800"}`
        }

        return `red.${colorMode === "dark" ? "200" : "800"}`
    }, [session, colorMode])

    function normalizeReputationString(reputation: string): string {
        return capitalize(reputation.toLowerCase().replace("_", " "))
    }

    return (
        <VStack align="left" py="15px" pr="30px" spacing="4">
            <HStack spacing="2">
                {session.web2Provider === Web2Provider.TWITTER ? (
                    <Icon boxSize="24px" as={FaTwitter} />
                ) : session.web2Provider === Web2Provider.GITHUB ? (
                    <Icon boxSize="24px" as={FaGithub} />
                ) : (
                    <Icon boxSize="24px" as={FaRedditAlien} />
                )}
                <Text fontSize="md">{session.user.username as string}</Text>
            </HStack>
            {session.user?.reputation && (
                <HStack spacing="2" pb="16px">
                    <Tooltip
                        label={`Your ${capitalize(session.web2Provider)} reputation is: ${session.user.reputation}.`}
                        placement="right-start"
                    >
                        <span>
                            <Icon boxSize="24px" color={getReputationColor()} as={FaAward} />
                        </span>
                    </Tooltip>
                    <Text fontSize="md">{normalizeReputationString(session.user.reputation as string)}</Text>
                </HStack>
            )}
            <HStack>
                <Button onClick={() => signOut()} size="md" colorScheme="primary" variant="link">
                    Sign out
                </Button>
            </HStack>
        </VStack>
    )
}
