import { Box, Text } from "@chakra-ui/react"
import React from "react"
import { Group } from "src/types/groups"

export type GroupBoxContentProps = {
    group: Group
}

export function GroupBoxContent({ group }: GroupBoxContentProps): JSX.Element {
    return (
        <Box bg="background.600" borderRadius="4">
            <Text py="2" px="4">
                Members
            </Text>
            <Text py="3" px="4" bg="background.700" borderBottomRadius="4">
                {group.size}
            </Text>
        </Box>
    )
}