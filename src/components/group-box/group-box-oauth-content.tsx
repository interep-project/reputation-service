import { Box, HStack, Icon, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"

export type GroupBoxOAuthContentProps = {
    goldGroupSize: number
    silverGroupSize: number
    bronzeGroupSize: number
    icon: IconType
}

export function GroupBoxOAuthContent({
    goldGroupSize,
    silverGroupSize,
    bronzeGroupSize,
    icon
}: GroupBoxOAuthContentProps): JSX.Element {
    return (
        <Box>
            <Table bg="background.700" variant="unstyled" size="md" borderRadius="4">
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
                    <Tr>
                        <Td py="3">
                            <HStack>
                                <Icon as={icon} color="gold.400" />
                                <Text>Gold</Text>
                            </HStack>
                        </Td>
                        <Td py="3">{goldGroupSize}</Td>
                    </Tr>
                    <Tr borderTopWidth="1px">
                        <Td py="3">
                            <HStack>
                                <Icon as={icon} color="silver" />
                                <Text>Silver</Text>
                            </HStack>
                        </Td>
                        <Td py="3">{silverGroupSize}</Td>
                    </Tr>
                    <Tr borderTopWidth="1px">
                        <Td py="3">
                            <HStack>
                                <Icon as={icon} color="bronze.400" />
                                <Text>Bronze</Text>
                            </HStack>
                        </Td>
                        <Td py="3">{bronzeGroupSize}</Td>
                    </Tr>
                </Tbody>
            </Table>
        </Box>
    )
}
