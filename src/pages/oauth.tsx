import {
    Button,
    Container,
    Divider,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { signOut, useSession } from "next-auth/client"
import { useRouter } from "next/router"
import React from "react"
import { IoMdArrowRoundBack } from "react-icons/io"
import { MdLens } from "react-icons/md"
import { capitalize } from "src/utils/common"

export default function OAuthProvider(): JSX.Element {
    const router = useRouter()
    const [session] = useSession()

    async function back() {
        if (session) {
            await signOut({ redirect: false })
        }

        await router.push("/")
    }

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.lg">
            {!session ? (
                <VStack h="300px" align="center" justify="center">
                    <Spinner thickness="4px" speed="0.65s" size="xl" />
                </VStack>
            ) : (
                <VStack align="left">
                    <HStack spacing="4" mb="10px" justify="space-between">
                        <HStack>
                            <IconButton
                                onClick={() => back()}
                                aria-label="Back"
                                variant="link"
                                icon={<IoMdArrowRoundBack />}
                            />
                            <Heading as="h2" size="xl" mb="10px">
                                {capitalize(session.provider)}
                            </Heading>
                        </HStack>

                        <HStack>
                            <MdLens color="gold" />
                            <Text fontWeight="bold">Gold Group</Text>
                        </HStack>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between" spacing="8" py="20px">
                        <Text color="background.400" fontSize="md">
                            Interep uses Semaphore to generate anonymous identities. Lorem ipsum dolor sit amet,
                            consectetur adipisci elit, sed do eiusmod tempor incidunt ut labore et dolore magna aliqua.
                        </Text>

                        <Button colorScheme="background" size="md" minWidth="250px">
                            Generate Semaphore ID
                        </Button>
                    </HStack>

                    <Divider />

                    <Text color="background.400" fontSize="sm" py="20px">
                        Group qualification is based on account activity. Interep will prompt you every # days to
                        authorize a provider to share your most recent credentials.
                    </Text>

                    <HStack spacing="2">
                        <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                            <Heading as="h4" size="md" pl="6" py="2">
                                Groups
                            </Heading>
                            <Divider />
                            <Table variant="unstyled">
                                <Thead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th isNumeric>Members</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td>
                                            <HStack>
                                                <MdLens color="gold" />
                                                <Text>Gold</Text>
                                            </HStack>
                                        </Td>
                                        <Td isNumeric>254</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>
                                            <HStack>
                                                <MdLens color="silver" />
                                                <Text>Silver</Text>
                                            </HStack>
                                        </Td>
                                        <Td isNumeric>3048</Td>
                                    </Tr>
                                    <Tr>
                                        <Td>
                                            <HStack>
                                                <MdLens color="bronze" />
                                                <Text>Bronze</Text>
                                            </HStack>
                                        </Td>
                                        <Td isNumeric>9144</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </VStack>
                        <VStack flex="1" align="left" bg="background.800" p="3" borderRadius="4px">
                            <Heading as="h4" size="md" pl="6" py="2">
                                Qualifications
                            </Heading>
                            <Divider />
                            <Table variant="unstyled">
                                <Thead>
                                    <Tr>
                                        <Th isNumeric>Followers</Th>
                                        <Th isNumeric>Likes</Th>
                                        <Th>Plan</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td isNumeric>{">"} 1k</Td>
                                        <Td isNumeric>{">"} 3k</Td>
                                        <Td>Yes</Td>
                                    </Tr>
                                    <Tr>
                                        <Td isNumeric>500 - 1k</Td>
                                        <Td isNumeric>{">"} 1k</Td>
                                        <Td>No</Td>
                                    </Tr>
                                    <Tr>
                                        <Td isNumeric>100 - 499</Td>
                                        <Td isNumeric>{">"} 500</Td>
                                        <Td>No</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </VStack>
                    </HStack>
                </VStack>
            )}
        </Container>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const authorized = !!req.cookies["__Secure-next-auth.session-token"] || !!req.cookies["next-auth.session-token"]

    if (!authorized) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}
