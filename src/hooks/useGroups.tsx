import { useToast } from "@chakra-ui/react"
import createIdentity from "@interep/identity"
import { OAuthProvider } from "@interep/reputation"
import { Signer } from "ethers"
import { useCallback, useState } from "react"
import { Toast } from "src/components/toast"
import config from "src/config"
import { Group, Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"
import useInterepAPI from "./useInterepAPI"

type ReturnParameters = {
    hasJoinedAGroup: (provider: OAuthProvider) => Promise<boolean | null>
    getGroup: (provider: Provider, groupName: string) => Promise<Group | null>
    getGroups: () => Promise<Group[] | null>
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer, provider: Provider) => Promise<string | null>
    hasIdentityCommitment: (
        identityCommitment: string,
        provider: Provider,
        groupName: string,
        join?: boolean
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

    const signMessage = useCallback(
        async (signer: Signer, message: string): Promise<string | null> => {
            try {
                setLoading(true)

                const signedMessage = await signer.signMessage(message)

                setLoading(false)
                return signedMessage
            } catch (error) {
                console.error(error)

                toast({
                    description: "Your signature is needed to create the identity commitment.",
                    variant: "subtle",
                    isClosable: true
                })

                setLoading(false)
                return null
            }
        },
        [toast]
    )

    const retrieveIdentityCommitment = useCallback(
        async (signer: Signer, provider: Provider): Promise<string | null> => {
            try {
                setLoading(true)

                const identity = await createIdentity((message) => signer.signMessage(message), capitalize(provider))
                const identityCommitment = identity.genIdentityCommitment()

                setLoading(false)
                return identityCommitment.toString()
            } catch (error) {
                console.error(error)

                toast({
                    description: "Your signature is needed to create the identity commitment.",
                    variant: "subtle",
                    isClosable: true
                })

                setLoading(false)
                return null
            }
        },
        [toast]
    )

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

            const date = new Date()
            const duration = ((date.getMinutes() % config.CRON_INTERVAL) + 20) * 1000

            toast({
                duration,
                render: () => (
                    <Toast
                        status="success"
                        duration={duration}
                        description={`You joined the ${capitalize(
                            provider
                        )} group correctly. You will be able to use this group in ~${duration / 1000} seconds.`}
                    />
                )
            })
            return true
        },
        [toast, addIdentityCommitment]
    )

    return {
        hasJoinedAGroup,
        getGroup,
        getGroups,
        signMessage,
        retrieveIdentityCommitment,
        hasIdentityCommitment,
        joinGroup,
        _loading
    }
}
