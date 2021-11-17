import { Button, HStack, Input, useToast } from "@chakra-ui/react"
import React, { useState } from "react"
import useInterRepAPI from "src/hooks/useInterRepAPI"

export default function EmailAddressBox(): JSX.Element {
    const toast = useToast()
    const { sendEmail } = useInterRepAPI()
    const [_email, setEmail] = useState<string>("")
    const [_loading, setLoading] = useState<boolean>(false)

    async function submitEmail(email: string) {
        if (!email.includes("@hotmail")) {
            toast({
                description: "You must enter a @hotmail address.",
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
            setEmail("")
        }
    }

    return (
        <HStack justify="space-between">
            <Input placeholder="Enter Email" value={_email} onChange={(event) => setEmail(event.target.value)} />
            <Button onClick={() => submitEmail(_email)} isLoading={_loading} isDisabled={!_email}>
                Submit
            </Button>
        </HStack>
    )
}
