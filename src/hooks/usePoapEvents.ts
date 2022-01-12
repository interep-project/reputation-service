import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import { getPoapEventsByAddress } from "src/core/poap"

type ReturnParameters = {
    getPoapEvents: (address: string) => Promise<string[] | null>
}

export default function usePoapEvents(): ReturnParameters {
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

    const getPoapEvents = useCallback(
        async (address: string) => {
            try {
                return await getPoapEventsByAddress(address)
            } catch (error) {
                showErrorMessage("Sorry, there was an unexpected error.")
                return null
            }
        },
        [showErrorMessage]
    )

    return {
        getPoapEvents
    }
}
