import { Container, Box, Heading } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { providers } from "ethers"
import QRCode from "qrcode.react"
import React, { useEffect, useState } from "react"
import useBrightId from "src/hooks/useBrightId"

export default function BrightIdPage(): JSX.Element {
    const { account } = useWeb3React<providers.Web3Provider>()
    const { getBrightId } = useBrightId()
    const [_url, setUrl ] = useState<string>('')
    useEffect(() => {
        ;(async () => {
            if (account ) {
                const QRLink = await getBrightId(account)
                setUrl(QRLink)
            }
        })()
    },[account, getBrightId])
    return (
        <>
            <Container flex="1" mb="80px" mt="180px" px="80px" maxW="container.lg">
                <Box bg="white" w="100%" p={4} color="black" alignItems="center" display="flex" flexDirection="column">
                    <Heading as="h3" size="lg">
                        Connect with BrightId
                    </Heading>
                    <Box>
                        <QRCode value={_url} />
                    </Box>
                </Box>
            </Container>
        </>
    )
}
