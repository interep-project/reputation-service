import { Box, Button, Heading, HStack, Icon } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"

export type GroupBoxProps = {
    title: string
    icon?: IconType
    content: any
    actionText: string
    actionFunction: (par?: any) => void
    loading?: boolean
    disabled?: boolean
}

export function GroupBox({
    title,
    icon,
    content,
    actionText,
    actionFunction,
    loading = false,
    disabled = false
}: GroupBoxProps): JSX.Element {
    return (
        <Box bg="background.800" p="5" borderRadius="4px">
            <HStack pb="5" spacing="4">
                {icon && <Icon as={icon} />}
                <Heading as="h4" size="md">
                    {title}
                </Heading>
            </HStack>

            {content}

            <Button
                onClick={actionFunction}
                colorScheme="background"
                mt="6"
                size="sm"
                disabled={disabled}
                isLoading={loading}
                isFullWidth
            >
                {actionText}
            </Button>
        </Box>
    )
}
