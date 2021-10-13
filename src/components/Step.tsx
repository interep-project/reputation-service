import {
    Button,
    Heading,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    useColorMode,
    VStack
} from "@chakra-ui/react"
import { BsChevronDown } from "react-icons/bs"
import React from "react"

type Properties = {
    title: string
    message: string
    actionText: string
    actionFunction: (par?: any) => void
    actionType?: "button" | "select"
    selectOptions?: string[]
    selectOptionFilter?: (option: string) => string
    loading?: boolean
    disabled?: boolean
}

export default function Step({
    title,
    message,
    actionText,
    actionFunction,
    actionType = "button",
    selectOptions,
    selectOptionFilter,
    loading = false,
    disabled = false
}: Properties): JSX.Element {
    const { colorMode } = useColorMode()

    return (
        <HStack
            bg={colorMode === "light" ? "gray.100" : "whiteAlpha.100"}
            p="26px"
            borderRadius="3xl"
            justify="space-between"
            opacity={disabled ? 0.6 : 1}
        >
            <VStack align="left">
                <Heading as="h4" size="md">
                    {title}
                </Heading>
                <Text>{message}</Text>
            </VStack>
            {actionType === "button" ? (
                <Button
                    onClick={actionFunction}
                    colorScheme="primary"
                    variant="ghost"
                    isLoading={loading}
                    isDisabled={disabled}
                >
                    {actionText}
                </Button>
            ) : actionType === "select" && selectOptions?.length ? (
                <Menu>
                    <MenuButton
                        colorScheme="primary"
                        variant="ghost"
                        as={Button}
                        rightIcon={<BsChevronDown />}
                        isDisabled={disabled}
                        isLoading={loading}
                    >
                        {actionText}
                    </MenuButton>
                    <MenuList>
                        {selectOptions.map((option) => (
                            <MenuItem key={option} onClick={() => actionFunction(option)}>
                                {selectOptionFilter && selectOptionFilter(option)}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            ) : null}
        </HStack>
    )
}
