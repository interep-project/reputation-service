import { Alert, AlertIcon, AlertTitle, Button, Container, HStack, Input } from "@chakra-ui/react"
import React, { useState } from "react"

export default function EmailAddressBox(): JSX.Element {
    const [_alertDisplay, setAlertDisplay] = useState<string>("none")
    const [_alertMessage, setAlertMessage] = useState<string>("")
    const [_alertType, setAlertType] = useState<"info" | "warning" | "success" | "error" | undefined>("info")

    async function submitEmail() {
        setAlertDisplay("none")
        const adr = document.getElementById("emailaddress") as HTMLInputElement
        if (adr != null) {
            const address_string = adr.value
            if (address_string.includes("@hotmail")) {
                console.log("address", address_string)
                let message = ""

                const requestOptions = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        address: address_string
                    })
                }

                console.log("status: ", message)
                setAlertDisplay("true")
                setAlertType("info")
                setAlertMessage("Sending email address to server...")

                console.log("sending email address to server...")
                message = "sending email address to server..."
                console.log("status: ", message)

                const response = await fetch("/api/email/sendEmail", requestOptions)
                const data = await response.json()
                console.log(data)
                console.log(data.message)
                message = data.message
                setAlertMessage(message)
            } else {
                setAlertType("error")
                setAlertDisplay("true")
                setAlertMessage("Email address must be @hotmail")
            }
        } else {
            setAlertType("error")
            setAlertDisplay("true")
            setAlertMessage("Please enter an email address")
            console.log("null adr")
        }
    }

    return (
        <Container my="15px" px="60px" maxW="container.xl">
            <HStack justify="space-between">
                <Input placeholder="Enter Email" id="emailaddress" />
                <Button onClick={() => submitEmail()}>Submit</Button>
            </HStack>

            {_alertDisplay === "true" ? (
                <Alert status={_alertType} marginTop="5px">
                    <AlertIcon />
                    <AlertTitle>{_alertMessage}</AlertTitle>
                </Alert>
            ) : (
                ""
            )}
        </Container>
    )
}
