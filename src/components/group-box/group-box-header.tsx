import { Heading, HStack, Icon } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"

export type GroupBoxHeaderProps = {
    title: string
    icon?: IconType
}

export function GroupBoxHeader({ title, icon }: GroupBoxHeaderProps): JSX.Element {
    return (
        <HStack pb="5" spacing="4">
            {icon && <Icon as={icon} w={5} h={5} />}

            <Heading as="h4" size="md">
                {title}
            </Heading>
        </HStack>
    )
}
