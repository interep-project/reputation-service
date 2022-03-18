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

type Properties = {
    title: string
    message: string
    onClose: () => void
    isOpen: boolean
    actions: JSX.Element
}

export default function AlertDialog({ title, message, onClose, isOpen, actions }: Properties): JSX.Element {
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
