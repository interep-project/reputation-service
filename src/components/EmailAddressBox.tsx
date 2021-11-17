import { Alert, AlertIcon, AlertTitle, Button, HStack, Input } from "@chakra-ui/react"
import React, { useState } from "react"
import useInterRepAPI from "src/hooks/useInterRepAPI"

export default function EmailAddressBox(): JSX.Element {
    const { sendEmail } = useInterRepAPI()
    const [email, setEmail] = useState<string>("")
    const [alertMessage, setAlertMessage] = useState<string>("")
    const [alertType, setAlertType] = useState<"info" | "warning" | "success" | "error">("info")

    async function submitEmail(email: string) {
        setAlertMessage("")

        if (!email) {
            setAlertType("error")
            setAlertMessage("Please enter an email address")

            return
        }

        if (!email.includes("@hotmail")) {
            setAlertType("error")
            setAlertMessage("Email address must be @hotmail")

            return
        }

        setAlertType("info")
        setAlertMessage("Sending a magic link to your email address")

        const response = await sendEmail({ email })

        if (response) {
            setEmail("")
            setAlertMessage("Magic link sent correctly, please check your email")
        }
    }

    return (
        <>
            <HStack justify="space-between">
                <Input placeholder="Enter Email" value={email} onChange={(event) => setEmail(event.target.value)} />
                <Button onClick={() => submitEmail(email)}>Submit</Button>
            </HStack>

            {alertMessage && (
                <Alert status={alertType} marginTop="5px">
                    <AlertIcon />
                    <AlertTitle>{alertMessage}</AlertTitle>
                </Alert>
            )}
        </>
    )
}
