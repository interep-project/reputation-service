import { Button, Divider, HStack, Icon, Spinner, Text, Tooltip, useColorMode, VStack } from "@chakra-ui/react"
import { calculateReputation, ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"
import { Session } from "next-auth"
import { signOut } from "next-auth/client"
import React, { useCallback, useEffect, useState } from "react"
import { BiAward } from "react-icons/bi"
import { FaAward, FaGithub, FaRedditAlien, FaTwitter } from "react-icons/fa"
import { getPOAPtokens } from "src/services/poap"
import { capitalize } from "src/utils/frontend/capitalize"

type Properties = {
    session?: Session | null
    address?: string
}

export default function SideBar({ session, address }: Properties): JSX.Element {
    const { colorMode } = useColorMode()
    const [_poapReputation, setPoapReputation] = useState<ReputationLevel>()

    const getReputationColor = useCallback(
        (reputation: ReputationLevel) => {
            if (typeof reputation === "string" && reputation !== ReputationLevel.NOT_SUFFICIENT) {
                return `${reputation.toLowerCase()}.${colorMode === "dark" ? "200" : "700"}`
            }

            return `red.${colorMode === "dark" ? "200" : "700"}`
        },
        [colorMode]
    )

    useEffect(() => {
        ;(async () => {
            if (address) {
                const tokens = await getPOAPtokens(address)
                const poapReputation = calculateReputation(Web2Provider.POAP, { tokens: tokens.length })

                setPoapReputation(poapReputation)
            }
        })()
    }, [address])

    return (
        <VStack align="left" divider={<Divider />} py="15px" pr="30px" spacing="4">
            {address && (
                <>
                    {_poapReputation ? (
                        <VStack align="left" spacing="3">
                            <Text fontWeight="extrabold" fontSize="xl">
                                Web3
                            </Text>
                            <HStack spacing="2">
                                <Icon boxSize="26px" as={FaAward} />
                                <Text fontSize="md">POAP</Text>
                            </HStack>
                            <HStack spacing="1">
                                <Text fontSize="md">Reputation: </Text>
                                <Tooltip label={`Your POAP reputation is: ${_poapReputation}.`} placement="right-start">
                                    <span>
                                        <Icon boxSize="24px" color={getReputationColor(_poapReputation)} as={BiAward} />
                                    </span>
                                </Tooltip>
                            </HStack>
                        </VStack>
                    ) : (
                        <VStack h="104px" align="center" justify="center">
                            <Spinner thickness="2px" speed="0.65s" size="md" />
                        </VStack>
                    )}
                </>
            )}
            {session && (
                <VStack align="left" spacing="3">
                    <Text fontWeight="extrabold" fontSize="xl">
                        Web2
                    </Text>
                    <HStack spacing="2">
                        {session.web2Provider === Web2Provider.TWITTER ? (
                            <Icon boxSize="26px" as={FaTwitter} />
                        ) : session.web2Provider === Web2Provider.GITHUB ? (
                            <Icon boxSize="26px" as={FaGithub} />
                        ) : (
                            <Icon boxSize="26px" as={FaRedditAlien} />
                        )}
                        <Text fontSize="md">{capitalize(session.web2Provider)}</Text>
                    </HStack>
                    <Text fontSize="md">Username: {session.user.username as string}</Text>
                    {session.user?.reputation && (
                        <HStack spacing="1">
                            <Text fontSize="md">Reputation: </Text>
                            <Tooltip
                                label={`Your ${capitalize(session.web2Provider)} reputation is: ${
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
