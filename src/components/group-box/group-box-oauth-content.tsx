import { HStack, Icon, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { GoInfo } from "react-icons/go"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"

export type GroupBoxOAuthContentProps = {
    groups: Group[]
    icon: IconType
    onInfoClick?: () => void
}

export function GroupBoxOAuthContent({ groups, icon, onInfoClick }: GroupBoxOAuthContentProps): JSX.Element {
    return (
        <Table variant="grid" colorScheme="background">
            <Thead>
                <Tr>
                    <Th>
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

                    <Th>Members</Th>
                </Tr>
            </Thead>
            <Tbody>
                {groups.map((group, i) => (
                    <Tr key={i.toString()}>
                        <Td py="3">
                            <HStack spacing="4">
                                <Icon as={icon} color={`${group.name}.400`} />
                                <Text>{capitalize(group.name)}</Text>
                            </HStack>
                        </Td>
                        <Td py="3">{group.size}</Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    )
}
