import EmailAddressBox from "src/components/EmailAddressBox"
import React, { useState } from "react"
import { Button, VStack } from "@chakra-ui/react"
import { FaEnvelope } from "react-icons/fa"
import { Session } from "next-auth"

type Parameters = {
    session: Session | null
}

export default function EmailInputButton({ session }: Parameters): JSX.Element {
    const [showResults, setShowResults] = useState(false)

    const onClick = () => setShowResults(!showResults)

    return (
        <div>
            <VStack spacing={4} align="left">
                <Button
                    onClick={() => onClick()}
                    leftIcon={<FaEnvelope />}
                    colorScheme="purple"
                    variant="semisolid"
                    isDisabled={!!session}
                >
                    @hotmail Email
                </Button>
                {showResults ? <EmailAddressBox /> : null}
            </VStack>
        </div>
    )
}
