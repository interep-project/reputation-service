import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { Group } from "src/types/groups"

export type GroupBoxContentProps = {
    group: Group
}

export function GroupBoxContent({ group }: GroupBoxContentProps): JSX.Element {
    return (
        <Table variant="grid" colorScheme="background">
            <Thead>
                <Tr>
                    <Th>Members</Th>
                </Tr>
            </Thead>
            <Tbody>
                <Tr>
                    <Td>{group.size}</Td>
                </Tr>
            </Tbody>
        </Table>
    )
}
