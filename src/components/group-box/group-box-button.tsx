import { Button } from "@chakra-ui/react"
import React from "react"

export type GroupBoxButtonProps = {
    children: string
    onClick: () => void
    loading?: boolean
    disabled?: boolean
}

export function GroupBoxButton({
    children,
    onClick,
    loading = false,
    disabled = false
}: GroupBoxButtonProps): JSX.Element {
    return (
        <Button
            onClick={onClick}
            colorScheme="background"
            mt="6"
            size="sm"
            disabled={disabled}
            isLoading={loading}
            isFullWidth
        >
            {children}
        </Button>
    )
}
