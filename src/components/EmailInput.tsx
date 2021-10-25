import EmailAddressBox from "src/components/EmailAddressBox"
import React, { useState } from "react"
import { Button, VStack} from "@chakra-ui/react"

import { FaEnvelope } from "react-icons/fa"


const EmailInputButton = (props) => {
    const [showResults, setShowResults] = useState(false)

    const session = props.session

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
        { showResults ? <EmailAddressBox /> : null }
        </VStack>
        </div>
    )
    }
    
      
export default EmailInputButton;
