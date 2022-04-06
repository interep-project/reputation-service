import { Box, HStack, Icon, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { GoInfo } from "react-icons/go"
import { Group } from "src/types/groups"
import { capitalize, formatNumber } from "src/utils/common"

export type GroupBoxOAuthContentProps = {
    groups: Group[]
    icon: IconType
    onInfoClick?: () => void
}

export function GroupBoxOAuthContent({ groups, icon, onInfoClick }: GroupBoxOAuthContentProps): JSX.Element {
    return (
        <Box>
            <Table bg="background.700" variant="unstyled" borderRadius="4">
                <Thead>
                    <Tr>
                        <Th position="relative" bg="background.600" borderTopLeftRadius="4px">
                            <HStack spacing="0">
                                <Text>Groups</Text>
                                {onInfoClick && (
                                    <IconButton
                                        onClick={onInfoClick}
                                        aria-label="More info"
                                        icon={<GoInfo />}
                                        variant="link"
                                    />
                                )}
                            </HStack>
                        </Th>

                        <Th bg="background.600" borderTopRightRadius="4px">
                            Members
                        </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {groups.map((g, i) => (
                        <Tr key={i.toString()}>
                            <Td py="3">
                                <HStack>
                                    <Icon as={icon} color={g.name} />
                                    <Text>{capitalize(g.name)}</Text>
                                </HStack>
                            </Td>
                            <Td py="3">
                                {g.size} / ~{formatNumber(2 ** g.depth)}
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    )
}
