import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    useDisclosure
} from "@chakra-ui/react"
import React, { useRef } from "react"

export type GroupBoxButtonProps = {
    alertTitle: string
    alertMessage: string
    children: string
    onClick: () => void
    loading?: boolean
    disabled?: boolean
}

export function GroupBoxButton({
    alertTitle,
    alertMessage,
    children,
    onClick,
    loading = false,
    disabled = false
}: GroupBoxButtonProps): JSX.Element {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = useRef() as any

    return (
        <Button
            onClick={onOpen}
            colorScheme="background"
            mt="6"
            size="sm"
            disabled={disabled}
            isLoading={loading}
            isFullWidth
        >
            {children}

            <AlertDialog
                motionPreset="slideInBottom"
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isOpen={isOpen}
                isCentered
            >
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>{alertTitle}</AlertDialogHeader>
                    <AlertDialogCloseButton ref={cancelRef} />
                    <AlertDialogBody>{alertMessage}</AlertDialogBody>
                    <AlertDialogFooter>
                        <Button
                            colorScheme="primary"
                            isFullWidth
                            onClick={() => {
                                onClose()
                                onClick()
                            }}
                        >
                            {children}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Button>
    )
}
