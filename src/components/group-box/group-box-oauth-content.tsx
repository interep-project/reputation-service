import { Box, HStack, Icon, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { Group } from "src/types/groups"
import { capitalize, formatNumber } from "src/utils/common"

export type GroupBoxOAuthContentProps = {
    groups: Group[]
    icon: IconType
}

export function GroupBoxOAuthContent({ groups, icon }: GroupBoxOAuthContentProps): JSX.Element {
    return (
        <Box>
            <Table bg="background.700" variant="unstyled" borderRadius="4">
                <Thead>
                    <Tr>
                        <Th bg="background.600" borderTopLeftRadius="4px">
                            Groups
                        </Th>
                        <Th bg="background.600" borderTopRightRadius="4px">
                            Members
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {groups.map((group) => (
                        <Tr>
                            <Td py="3">
                                <HStack>
                                    <Icon as={icon} color={group.name} />
                                    <Text>{capitalize(group.name)}</Text>
                                </HStack>
                            </Td>
                            <Td py="3">
                                {group.size} / ~{formatNumber(2 ** group.depth)}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    )
}