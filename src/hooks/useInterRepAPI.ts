import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import {
    addIdentityCommitment as _addIdentityCommitment,
    removeIdentityCommitment as _removeIdentityCommitment,
    hasJoinedAGroup as _hasJoinedAGroup,
    hasIdentityCommitment as _hasIdentityCommitment,
    isLinkedToAddress as _isLinkedToAddress,
    getGroup as _getGroup,
    getUserBadges as _getUserBadges,
    linkAccounts as _linkAccounts,
    mintBadge as _mintBadge,
    unlinkAccounts as _unlinkAccounts,
    sendEmail as _sendEmail
} from "src/utils/frontend/api"

type API = {
    addIdentityCommitment: typeof _addIdentityCommitment
    removeIdentityCommitment: typeof _removeIdentityCommitment
    hasIdentityCommitment: typeof _hasIdentityCommitment
    getGroup: typeof _getGroup
    isLinkedToAddress: typeof _isLinkedToAddress
    mintBadge: typeof _mintBadge
    hasJoinedAGroup: typeof _hasJoinedAGroup
    linkAccounts: typeof _linkAccounts
    getUserBadges: typeof _getUserBadges
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
        hasIdentityCommitment: (parameters) => handleApiFunction(_hasIdentityCommitment, parameters),
        getGroup: (parameters) => handleApiFunction(_getGroup, parameters),
        isLinkedToAddress: () => handleApiFunction(_isLinkedToAddress),
        mintBadge: (parameters) => handleApiFunction(_mintBadge, parameters),
        hasJoinedAGroup: () => handleApiFunction(_hasJoinedAGroup),
        linkAccounts: (parameters) => handleApiFunction(_linkAccounts, parameters),
        getUserBadges: (parameters) => handleApiFunction(_getUserBadges, parameters),
        unlinkAccounts: (parameters) => handleApiFunction(_unlinkAccounts, parameters),
        sendEmail: (parameters) => handleApiFunction(_sendEmail, parameters)
    }
}
