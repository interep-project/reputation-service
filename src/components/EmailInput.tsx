import { Button, useBoolean, VStack } from "@chakra-ui/react"
import { Session } from "next-auth"
import React from "react"
import { FaEnvelope } from "react-icons/fa"
import EmailAddressBox from "src/components/EmailAddressBox"

type Parameters = {
    session: Session | null
}

export default function EmailInputButton({ session }: Parameters): JSX.Element {
    const [_emailInput, showEmailInput] = useBoolean()

    return (
        <div>
            <VStack spacing={4} align="left">
                <Button
                    onClick={showEmailInput.toggle}
                    leftIcon={<FaEnvelope />}
                    colorScheme="purple"
                    variant="semisolid"
                    isDisabled={!!session}
                >
                    @hotmail Email
                </Button>
                {_emailInput ? <EmailAddressBox /> : null}
            </VStack>
        </div>
    )
}
