import { useToast } from "@chakra-ui/react"
import { OAuthProvider } from "@interrep/reputation-criteria"
import semethid from "@interrep/semethid"
import { Signer } from "ethers"
import { useCallback, useState } from "react"
import { Group, Provider } from "src/types/groups"
import capitalize from "src/utils/common/capitalize"
import useInterRepAPI from "./useInterRepAPI"

type ReturnParameters = {
    checkGroup: (provider: OAuthProvider) => Promise<boolean | null>
    getGroup: (provider: Provider, groupName: string) => Promise<Group | null>
    signMessage: (signer: Signer, message: string) => Promise<string | null>
    retrieveIdentityCommitment: (signer: Signer, provider: Provider) => Promise<string | null>
    checkIdentityCommitment: (identityCommitment: string, provider: Provider, groupName: string) => Promise<true | null>
    joinGroup: (identityCommitment: string, provider: Provider, groupName: string, body: any) => Promise<true | null>
    _loading: boolean
}

export default function useGroups(): ReturnParameters {
    const [_loading, setLoading] = useState<boolean>(false)
    const {
        addIdentityCommitment,
        checkIdentityCommitment: _checkIdentityCommitment,
        checkGroup: _checkGroup,
        getGroup: _getGroup
    } = useInterRepAPI()
    const toast = useToast()

    const checkGroup = useCallback(async (): Promise<boolean | null> => {
        setLoading(true)

        const hasJoinedAGroup = await _checkGroup()

        if (hasJoinedAGroup === null) {
            setLoading(false)
            return null
        }

        setLoading(false)
        return hasJoinedAGroup
    }, [_checkGroup])

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

                const identityCommitment = await semethid(
                    (message) => signer.signMessage(message),
                    capitalize(provider)
                )

                setLoading(false)
                return identityCommitment
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

    const checkIdentityCommitment = useCallback(
        async (identityCommitment: string, provider: Provider, groupName: string): Promise<true | null> => {
            setLoading(true)

            const alreadyExist = await _checkIdentityCommitment({
                provider,
                groupName,
                identityCommitment
            })

            if (alreadyExist === null) {
                setLoading(false)
                return null
            }

            if (alreadyExist) {
                toast({
                    description: `You already joined this group.`,
                    variant: "subtle",
                    isClosable: true
                })
                setLoading(false)
                return null
            }

            setLoading(false)
            return true
        },
        [toast, _checkIdentityCommitment]
    )

    const joinGroup = useCallback(
        async (identityCommitment: string, provider: Provider, groupName: string, body: any): Promise<true | null> => {
            setLoading(true)

            const rootHash = await addIdentityCommitment({
                provider,
                groupName,
                identityCommitment,
                ...body
            })

            if (rootHash === null) {
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

    return {
        checkGroup,
        getGroup,
        signMessage,
        retrieveIdentityCommitment,
        checkIdentityCommitment,
        joinGroup,
        _loading
    }
}
