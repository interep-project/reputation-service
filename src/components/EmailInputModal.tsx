import {
    Button,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useToast
} from "@chakra-ui/react"
import React, { useState } from "react"
import getEmailDomainsByEmail from "src/core/email/getEmailDomainsByEmail"
import useInterRepAPI from "src/hooks/useInterRepAPI"

type Parameters = {
    isOpen: boolean
    onClose: () => void
}

export default function EmailInputModal({ isOpen, onClose }: Parameters): JSX.Element {
    const toast = useToast()
    const { sendEmail } = useInterRepAPI()
    const [_email, setEmail] = useState<string>("")
    const [_loading, setLoading] = useState<boolean>(false)

    async function submitEmail(email: string) {
        const groupId = getEmailDomainsByEmail(email)

        if (groupId.length === 0) {
            toast({
                description: "You must enter a supported email address.",
                variant: "subtle",
                status: "error",
                isClosable: true
            })

            return
        }

        setLoading(true)

        const response = await sendEmail({ email })

        if (response) {
            toast({
                description: "Magic link sent correctly, please check your email.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            onClose()
            setEmail("")
        } else {
            toast({
                description: `Error sending email to ${email}`,
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            setEmail("")
        }
    }

    return (
        <Modal isCentered onClose={onClose} isOpen={isOpen} motionPreset="slideInBottom" colorScheme="pink">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader fontSize="2xl">Insert your email</ModalHeader>
                <ModalCloseButton />
                <ModalBody fontSize="lg">
                    Supported email domains include hotmail, outlook and all .edu addresses.
                </ModalBody>
                <ModalFooter>
                    <HStack justify="space-between">
                        <Input
                            placeholder="Enter Email"
                            value={_email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        <Button onClick={() => submitEmail(_email)} isLoading={_loading} isDisabled={!_email}>
                            Submit
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
