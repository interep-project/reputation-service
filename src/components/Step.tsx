import { Button, Heading, HStack, Text, useColorMode, VStack } from "@chakra-ui/react"
import React from "react"

type Properties = {
    title: string
    message: string
    buttonText: string
    buttonFunction?: () => void
    loading?: boolean
    disabled?: boolean
}

export default function Step({
    title,
    message,
    buttonText,
    buttonFunction,
    loading = false,
    disabled = false
}: Properties): JSX.Element {
    const { colorMode } = useColorMode()

    return (
        <HStack
            bg={colorMode === "light" ? "gray.100" : "whiteAlpha.100"}
            p="26px"
            borderRadius="3xl"
            justify="space-between"
            opacity={disabled ? 0.6 : 1}
        >
            <VStack align="left">
                <Heading as="h4" size="md">
                    {title}
                </Heading>
                <Text>{message}</Text>
            </VStack>
            <Button
                onClick={buttonFunction}
                colorScheme="primary"
                variant="ghost"
                isLoading={loading}
                isDisabled={disabled}
            >
                {buttonText}
            </Button>
        </HStack>
    )
}
