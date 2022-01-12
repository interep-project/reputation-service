import { Button, Container, Heading, HStack, Icon, Tooltip, useColorMode, useDisclosure } from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { signIn, useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React from "react"
import { FaAward, FaEnvelope, FaGithub, FaInfoCircle, FaRedditAlien, FaTwitter } from "react-icons/fa"
import EmailInputModal from "src/components/EmailInputModal"

export default function Providers(): JSX.Element {
    const router = useRouter()
    const [session] = useSession()
    const { colorMode } = useColorMode()
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
        <Container flex="1" mb="80px" mt="180px" px="80px" maxW="container.lg">
            <Heading as="h2" mb="30px" size="xl">
                Providers
                <Tooltip label="Select one of our supported providers to join a group." placement="right-start">
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
            <HStack spacing={4} align="left">
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

                <Button
                    onClick={onOpen}
                    leftIcon={<FaEnvelope />}
                    colorScheme="green"
                    variant="semisolid"
                    isDisabled={isOpen}
                >
                    Email
                </Button>
                <EmailInputModal isOpen={isOpen} onClose={onClose} />

                <Button
                    onClick={() => router.push("/groups/poap")}
                    leftIcon={<FaAward />}
                    colorScheme="purple"
                    variant="semisolid"
                    isDisabled={isOpen}
                >
                    POAP
                </Button>
            </HStack>
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            props: {}
        }
    }

    return {
        redirect: {
            destination: "/groups",
            permanent: false
        }
    }
}
