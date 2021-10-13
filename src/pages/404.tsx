import { Heading, VStack, Icon } from "@chakra-ui/react"
import { FaSadTear } from "react-icons/fa"
import React from "react"

export default function NotFound(): JSX.Element {
    return (
        <>
            <VStack h="200px" align="center" justify="center">
                <Heading as="h2" size="xl">
                    404 Not Found <Icon boxSize="35px" as={FaSadTear} />
                </Heading>
            </VStack>
        </>
    )
}
