import { useToast } from "@chakra-ui/react"
import { OAuthProvider } from "@interrep/reputation"
import createIdentity from "@interrep/identity"
import { Signer } from "ethers"
import { useCallback, useState } from "react"
import { Group, Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"
import useInterRepAPI from "./useInterRepAPI"

type ReturnParameters = {
    hasJoinedAGroup: (provider: OAuthProvider) => Promise<boolean | null>
    getGroup: (provider: Provider, groupName: string) => Promise<Group | null>
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer, provider: Provider) => Promise<string | null>
    hasIdentityCommitment: (
        identityCommitment: string,
        provider: Provider,
        groupName: string,
        join?: boolean
    ) => Promise<boolean | null>
    joinGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    leaveGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    _loading: boolean
}

export default function useGroups(): ReturnParameters {
    const [_loading, setLoading] = useState<boolean>(false)
    const {
        addIdentityCommitment,
        removeIdentityCommitment,
        hasIdentityCommitment: _hasIdentityCommitment,
        hasJoinedAGroup: _hasJoinedAGroup,
        getGroup: _getGroup
    } = useInterRepAPI()
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
            toast({
                description: `You joined the ${capitalize(provider)} group correctly.`,
                variant: "subtle",
                isClosable: true
            })
            return true
        },
        [toast, addIdentityCommitment]
    )

    const leaveGroup = useCallback(
        async (identityCommitment: string, provider: Provider, groupName: string, body: any): Promise<true | null> => {
            setLoading(true)

            const response = await removeIdentityCommitment({
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
                description: `You left the ${capitalize(provider)} group correctly.`,
                variant: "subtle",
                isClosable: true
            })
            return true
        },
        [toast, removeIdentityCommitment]
    )

    return {
        hasJoinedAGroup,
        getGroup,
        signMessage,
        retrieveIdentityCommitment,
        hasIdentityCommitment,
        joinGroup,
        leaveGroup,
        _loading
    }
}
