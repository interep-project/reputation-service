import { OAuthProvider } from "@interep/reputation"
import { useCallback, useState } from "react"
import config from "src/config"
import { Group, Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"
import useInterepAPI from "./useInterepAPI"
import useToast from "./useToast"

type ReturnParameters = {
    hasJoinedAGroup: (provider: OAuthProvider) => Promise<boolean | null>
    getGroup: (provider: Provider, groupName: string) => Promise<Group | null>
    getGroups: () => Promise<Group[] | null>
    hasIdentityCommitment: (
        identityCommitment: string,
        provider: Provider,
        groupName: string
    ) => Promise<boolean | null>
    joinGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    _loading: boolean
}

export default function useGroups(): ReturnParameters {
    const [_loading, setLoading] = useState<boolean>(false)
    const {
        addIdentityCommitment,
        hasIdentityCommitment: _hasIdentityCommitment,
        hasJoinedAGroup: _hasJoinedAGroup,
        getGroup: _getGroup,
        getGroups: _getGroups
    } = useInterepAPI()
    const toast = useToast()

    const hasJoinedAGroup = useCallback(async (): Promise<boolean | null> => {
        setLoading(true)

        const hasJoinedAGroup = await _hasJoinedAGroup()

        if (hasJoinedAGroup === null) {
            setLoading(false)
            return null
        }

        setLoading(false)

        return hasJoinedAGroup
    }, [_hasJoinedAGroup])

    const getGroup = useCallback(
        async (provider: Provider, groupName: string): Promise<Group | null> => {
            setLoading(true)

            const group = await _getGroup({
                provider,
                groupName
            })

            if (group === null) {
                setLoading(false)
                return null
            }

            setLoading(false)
            return group
        },
        [_getGroup]
    )

    const getGroups = useCallback(async (): Promise<Group[] | null> => {
        setLoading(true)

        const groups = await _getGroups()

        if (groups === null) {
            setLoading(false)
            return null
        }

        setLoading(false)
        return groups
    }, [_getGroups])

    const hasIdentityCommitment = useCallback(
        async (identityCommitment: string, provider: Provider, groupName: string): Promise<boolean | null> => {
            setLoading(true)

            const hasJoined = await _hasIdentityCommitment({
                provider,
                groupName,
                identityCommitment
            })

            if (hasJoined === null) {
                setLoading(false)
                return null
            }

            setLoading(false)

            return hasJoined
        },
        [_hasIdentityCommitment]
    )

    const joinGroup = useCallback(
        async (identityCommitment: string, provider: Provider, groupName: string, body: any): Promise<true | null> => {
            setLoading(true)

            const response = await addIdentityCommitment({
                provider,
                groupName,
                identityCommitment,
                ...body
            })

            if (response === null) {
                setLoading(false)
                return null
            }

            setLoading(false)

            toast({
                description: `You joined the ${capitalize(provider)} group correctly.`,
                status: "success"
            })

            const date = new Date()
            // Seconds before the next hour.
            const remainingSeconds = (60 - date.getMinutes()) * 60 + (60 - date.getSeconds())
            const duration = ((remainingSeconds % (config.CRON_INTERVAL * 60)) + 20) * 1000

            toast({
                description: `You will be able to use this group in ~${duration / 1000} seconds.`,
                status: "info",
                progress: true,
                duration
            })

            return true
        },
        [toast, addIdentityCommitment]
    )

    return {
        hasJoinedAGroup,
        getGroup,
        getGroups,
        hasIdentityCommitment,
        joinGroup,
        _loading
    }
}
