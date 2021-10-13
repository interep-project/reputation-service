import { Button, Heading, VStack, Icon, Tooltip, useColorMode } from "@chakra-ui/react"
import { FaGithub, FaRedditAlien, FaTwitter, FaInfoCircle } from "react-icons/fa"
import { signIn, useSession } from "next-auth/client"
import React from "react"

export default function Signin(): JSX.Element {
    const [session] = useSession()
    const { colorMode } = useColorMode()

    return (
        <>
            <Heading as="h2" mb="30px" size="xl">
                Web2 Login
                <Tooltip
                    label="Sign in with one of our supported Web2 providers to obtain your reputation."
                    placement="right-start"
                >
                    <span>
                        <Icon
                            boxSize="20px"
                            ml="10px"
                            mb="5px"
                            color={colorMode === "light" ? "gray.500" : "background.200"}
                            as={FaInfoCircle}
                        />
                    </span>
                </Tooltip>
            </Heading>
            <VStack spacing={4} align="left">
                <Button
                    onClick={() => signIn("twitter")}
                    leftIcon={<FaTwitter />}
                    colorScheme="twitter"
                    variant="semisolid"
                    isDisabled={!!session}
                >
                    Twitter
                </Button>
                <Button
                    onClick={() => signIn("github")}
                    leftIcon={<FaGithub />}
                    colorScheme="github"
                    variant="semisolid"
                    isDisabled={!!session}
                >
                    Github
                </Button>
                <Button
                    onClick={() => signIn("reddit")}
                    leftIcon={<FaRedditAlien />}
                    colorScheme="reddit"
                    variant="semisolid"
                    isDisabled={!!session}
                >
                    Reddit
                </Button>
            </VStack>
        </>
    )
}
