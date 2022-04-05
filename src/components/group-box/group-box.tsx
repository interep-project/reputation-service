import { Box } from "@chakra-ui/react"
import React from "react"

export type GroupBoxProps = {
    children: JSX.Element[]
}

export function GroupBox({ children }: GroupBoxProps): JSX.Element {
    return (
        <Box bg="background.800" p="5" borderRadius="4px">
            {children}
        </Box>
    )
}
