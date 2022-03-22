import { Box, Button, Heading, HStack } from "@chakra-ui/react"
import React from "react"

export type GroupBoxProps = {
    title: string
    icon: any
    content: any
    actionText: string
    actionFunction: (par?: any) => void
    disabled?: boolean
}

export function GroupBox({
    title,
    icon,
    content,
    actionText,
    actionFunction,
    disabled = false
}: GroupBoxProps): JSX.Element {
    return (
        <Box bg="background.800" p="5" borderRadius="4px">
            <HStack pb="5" spacing="4">
                {icon}
                <Heading as="h4" size="md">
                    {title}
                </Heading>
            </HStack>

            {content}

            <Button onClick={actionFunction} colorScheme="background" mt="6" size="md" disabled={disabled} isFullWidth>
                {actionText}
            </Button>
        </Box>
    )
}
