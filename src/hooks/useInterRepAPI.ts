import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import {
    addIdentityCommitment as _addIdentityCommitment,
    removeIdentityCommitment as _removeIdentityCommitment,
    checkGroup as _checkGroup,
    checkIdentityCommitment as _checkIdentityCommitment,
    checkLink as _checkLink,
    getGroup as _getGroup,
    getReputation as _getReputation,
    getUserTokens as _getUserTokens,
    linkAccounts as _linkAccounts,
    mintToken as _mintToken,
    unlinkAccounts as _unlinkAccounts,
    sendEmail as _sendEmail
} from "src/utils/frontend/api"

type API = {
    addIdentityCommitment: typeof _addIdentityCommitment
    removeIdentityCommitment: typeof _removeIdentityCommitment
    checkIdentityCommitment: typeof _checkIdentityCommitment
    getGroup: typeof _getGroup
    checkLink: typeof _checkLink
    mintToken: typeof _mintToken
    checkGroup: typeof _checkGroup
    linkAccounts: typeof _linkAccounts
    getReputation: typeof _getReputation
    getUserTokens: typeof _getUserTokens
    unlinkAccounts: typeof _unlinkAccounts
    sendEmail: typeof _sendEmail
}

/**
 * InterRep API hook to handle the http errors and show toast messages.
 * @returns InterRep API functions
 */
export default function useInterRepAPI(): API {
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
        checkIdentityCommitment: (parameters) => handleApiFunction(_checkIdentityCommitment, parameters),
        getGroup: (parameters) => handleApiFunction(_getGroup, parameters),
        checkLink: () => handleApiFunction(_checkLink),
        mintToken: (parameters) => handleApiFunction(_mintToken, parameters),
        checkGroup: () => handleApiFunction(_checkGroup),
        linkAccounts: (parameters) => handleApiFunction(_linkAccounts, parameters),
        getReputation: (parameters) => handleApiFunction(_getReputation, parameters),
        getUserTokens: (parameters) => handleApiFunction(_getUserTokens, parameters),
        unlinkAccounts: (parameters) => handleApiFunction(_unlinkAccounts, parameters),
        sendEmail: (parameters) => handleApiFunction(_sendEmail, parameters)
    }
}
