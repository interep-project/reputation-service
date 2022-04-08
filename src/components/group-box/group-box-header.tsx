import { Heading, HStack, Icon, Text, Tooltip } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { FaCheck } from "react-icons/fa"

export type GroupBoxHeaderProps = {
    title: string
    icon?: IconType
    joined?: boolean
}

export function GroupBoxHeader({ title, icon, joined }: GroupBoxHeaderProps): JSX.Element {
    return (
        <HStack pb="5" justify="space-between">
            <HStack spacing="4">
                {icon && <Icon as={icon} w={5} h={5} />}

                <Heading as="h4" size="md">
                    {title}
                </Heading>
            </HStack>
            {joined && (
                <Tooltip label="You are a member of this group">
                    <HStack>
                        <FaCheck color="green" />
                        <Text color="green">Joined</Text>
                    </HStack>
                </Tooltip>
            )}
        </HStack>
    )
}
