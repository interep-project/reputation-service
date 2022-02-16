import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import {
    addIdentityCommitment as _addIdentityCommitment,
    removeIdentityCommitment as _removeIdentityCommitment,
    hasJoinedAGroup as _hasJoinedAGroup,
    hasIdentityCommitment as _hasIdentityCommitment,
    getGroup as _getGroup,
    sendEmail as _sendEmail
} from "src/utils/frontend/api"

type ReturnParameters = {
    addIdentityCommitment: typeof _addIdentityCommitment
    removeIdentityCommitment: typeof _removeIdentityCommitment
    hasIdentityCommitment: typeof _hasIdentityCommitment
    getGroup: typeof _getGroup
    hasJoinedAGroup: typeof _hasJoinedAGroup
    sendEmail: typeof _sendEmail
}

/**
 * Interep API hook to handle the http errors and show toast messages.
 * @returns Interep API functions
 */
export default function useInterepAPI(): ReturnParameters {
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

    const handleApiFunction = useCallback(
        async (apiFunction: (parameters: any) => any | number, parameters?: any) => {
            const response = await apiFunction(parameters)

            if (typeof response === "number") {
                switch (response) {
                    case 403:
                        showErrorMessage("Sorry, it seems you do not have the right permissions.")
                        break
                    default:
                        showErrorMessage("Sorry, there was an unexpected error.")
                }

                return null
            }

            return response
        },
        [showErrorMessage]
    )

    return {
        addIdentityCommitment: (parameters) => handleApiFunction(_addIdentityCommitment, parameters),
        removeIdentityCommitment: (parameters) => handleApiFunction(_removeIdentityCommitment, parameters),
        hasIdentityCommitment: (parameters) => handleApiFunction(_hasIdentityCommitment, parameters),
        getGroup: (parameters) => handleApiFunction(_getGroup, parameters),
        hasJoinedAGroup: () => handleApiFunction(_hasJoinedAGroup),
        sendEmail: (parameters) => handleApiFunction(_sendEmail, parameters)
    }
}
