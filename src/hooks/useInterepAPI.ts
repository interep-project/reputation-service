import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import {
    addIdentityCommitment as _addIdentityCommitment,
    hasJoinedAGroup as _hasJoinedAGroup,
    hasIdentityCommitment as _hasIdentityCommitment,
    getGroup as _getGroup,
    getGroups as _getGroups,
    sendEmail as _sendEmail
} from "src/utils/frontend/api"

type ReturnParameters = {
    addIdentityCommitment: typeof _addIdentityCommitment
    hasIdentityCommitment: typeof _hasIdentityCommitment
    getGroup: typeof _getGroup
    getGroups: typeof _getGroups
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
        hasIdentityCommitment: (parameters) => handleApiFunction(_hasIdentityCommitment, parameters),
        getGroup: (parameters) => handleApiFunction(_getGroup, parameters),
        getGroups: () => handleApiFunction(_getGroups),
        hasJoinedAGroup: () => handleApiFunction(_hasJoinedAGroup),
        sendEmail: (parameters) => handleApiFunction(_sendEmail, parameters)
    }
}
