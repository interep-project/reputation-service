import { Heading, HStack, Icon, Text, Tooltip } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { FaCheck } from "react-icons/fa"

export type GroupBoxHeaderProps = {
    title: string
    icon?: IconType
    iconColor?: string
    joined?: boolean
}

export function GroupBoxHeader({ title, icon, iconColor, joined }: GroupBoxHeaderProps): JSX.Element {
    return (
        <HStack pb="5" justify="space-between">
            <HStack spacing="4">
                {icon && <Icon as={icon} color={iconColor} w={5} h={5} />}

                <Heading as="h4" size="md">
                    {title}
                </Heading>
            </HStack>
            {joined && (
                <Tooltip label="You are a member of this group">
                    <HStack>
                        <Icon as={FaCheck} color="green.200" />
                        <Text color="green.200">Joined</Text>
                    </HStack>
                </Tooltip>
            )}
        </HStack>
    )
}
