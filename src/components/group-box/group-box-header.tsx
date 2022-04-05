import { Heading, HStack, Icon, IconButton } from "@chakra-ui/react"
import React from "react"
import { IconType } from "react-icons"
import { FaInfoCircle } from "react-icons/fa"

export type GroupBoxHeaderProps = {
    title: string
    icon?: IconType
    onInfoClick?: () => void
}

export function GroupBoxHeader({ title, icon, onInfoClick }: GroupBoxHeaderProps): JSX.Element {
    return (
        <HStack pb="5" justify="space-between">
            <HStack spacing="4">
                {icon && <Icon as={icon} />}
                <Heading as="h4" size="md">
                    {title}
                </Heading>
            </HStack>
            {onInfoClick && (
                <IconButton
                    onClick={onInfoClick}
                    aria-label="More info"
                    icon={<FaInfoCircle />}
                    variant="link"
                    pl="20px"
                />
            )}
        </HStack>
    )
}
