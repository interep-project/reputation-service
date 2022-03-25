import {
    AlertDialog as OAlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay
} from "@chakra-ui/react"
import React, { useRef } from "react"

export type AlertDialogProps = {
    title: string
    message: string
    onClose: () => void
    isOpen: boolean
    actions: JSX.Element
}

export function AlertDialog({ title, message, onClose, isOpen, actions }: AlertDialogProps): JSX.Element {
    const cancelRef = useRef() as any

    return (
        <OAlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={() => onClose()}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogHeader>{title}</AlertDialogHeader>
                <AlertDialogCloseButton ref={cancelRef} />
                <AlertDialogBody>{message}</AlertDialogBody>
                <AlertDialogFooter>{actions}</AlertDialogFooter>
            </AlertDialogContent>
        </OAlertDialog>
    )
}
