import { Box, Text, List, ListItem, ListIcon, HStack, Divider } from "@chakra-ui/react"
import { MdLens } from "react-icons/md"
import React from "react"

type Properties = {
    goldMembers: number
    silverMembers: number
    bronzeMembers: number
}

export default function GroupBoxOAuthContent({ goldMembers, silverMembers, bronzeMembers }: Properties): JSX.Element {
    return (
        <Box bg="background.600" borderRadius="4">
            <Text py="2" px="4">
                Group members
            </Text>
            <List py="3" px="4" bg="background.700" spacing="2" borderBottomRadius="4">
                <ListItem>
                    <HStack justify="space-between">
                        <Box>
                            <ListIcon as={MdLens} color="gold.400" />
                            Gold
                        </Box>
                        <Text>{goldMembers}</Text>
                    </HStack>
                </ListItem>
                <Divider />
                <ListItem>
                    <HStack justify="space-between">
                        <Box>
                            <ListIcon as={MdLens} color="silver" />
                            Silver
                        </Box>
                        <Text>{silverMembers}</Text>
                    </HStack>
                </ListItem>
                <Divider />
                <ListItem>
                    <HStack justify="space-between">
                        <Box>
                            <ListIcon as={MdLens} color="bronze.400" />
                            Bronze
                        </Box>
                        <Text>{bronzeMembers}</Text>
                    </HStack>
                </ListItem>
            </List>
        </Box>
    )
}
