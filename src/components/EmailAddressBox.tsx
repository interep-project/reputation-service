import { Button, HStack, Input, useToast } from "@chakra-ui/react"
import React, { useState } from "react"
import useInterRepAPI from "src/hooks/useInterRepAPI"
import checkEmailAddress from "src/core/email/emailAddressChecker"

export default function EmailAddressBox(): JSX.Element {
    const toast = useToast()
    const { sendEmail } = useInterRepAPI()
    const [_email, setEmail] = useState<string>("")
    const [_loading, setLoading] = useState<boolean>(false)

    async function submitEmail(email: string) {

        let groupId = checkEmailAddress(email)

        console.log("groupId",groupId)
               

        if (!groupId) {
            toast({
                description: "You must enter a @hotmail address.",
                variant: "subtle",
                status: "error",
                isClosable: true
            })

            return
        }

        setLoading(true)
        console.log(email)

        const response = await sendEmail({ email, groupId })
        console.log("response",response)

        if (response) {
            toast({
                description: "Magic link sent correctly, please check your email.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
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
        <HStack justify="space-between">
            <Input placeholder="Enter Email" value={_email} onChange={(event) => setEmail(event.target.value)} />
            <Button onClick={() => submitEmail(_email)} isLoading={_loading} isDisabled={!_email}>
                Submit
            </Button>
        </HStack>
    )
}
