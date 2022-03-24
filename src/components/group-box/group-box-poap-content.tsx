import { Box, Text } from "@chakra-ui/react"
import React from "react"

export type GroupBoxPoapContentProps = {
    groupSize: number
}

export function GroupBoxPoapContent({ groupSize }: GroupBoxPoapContentProps): JSX.Element {
    return (
        <Box bg="background.600" borderRadius="4">
            <Text py="2" px="4">
                Group members
            </Text>
            <Text py="3" px="4" bg="background.700" borderBottomRadius="4">
                {groupSize}
            </Text>
        </Box>
    )
}
