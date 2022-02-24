import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import getBrightIdByAddress from "src/core/onchain/brightid"

type ReturnParameters = {
    getBrightId: (address: string) => Promise<string>
}


export default function useBrightId(): ReturnParameters {
    const toast = useToast()

    const showErrorMessage = useCallback(
        (message: string) => {
            toast({
                description: message,
                variant: "subtle",
                status: "error"
            })
        },
        [toast]
    )

    const getBrightId = useCallback(
        async (address: string) => {
            try {
                return await getBrightIdByAddress(address)
            } catch (error) {
                showErrorMessage("Sorry, there was an unexpected error.")
                return ""
            }
        },
        [showErrorMessage]
    )

    return {
        getBrightId
    }
}
