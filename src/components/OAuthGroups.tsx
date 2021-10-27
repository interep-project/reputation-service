import { Spinner, Text, VStack } from "@chakra-ui/react"
import { ReputationLevel, OAuthProvider } from "@interrep/reputation-criteria"
import { Signer } from "ethers"
import { useSession } from "next-auth/client"
import { useCallback, useContext, useEffect, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group } from "src/types/groups"
import capitalize from "src/utils/common/capitalize"

export default function OAuthGroups(): JSX.Element {
    const [session] = useSession()
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_description, setDescription] = useState<string>()
    const [_group, setGroup] = useState<Group | null>(null)
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const {
        retrieveIdentityCommitment,
        checkIdentityCommitment,
        joinGroup,
        checkGroup,
        getGroup,
        _loading
    } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (session) {
                const { provider, user } = session
                const hasJoinedAGroup = await checkGroup(provider as OAuthProvider)

                if (hasJoinedAGroup) {
                    setDescription(`It seems you already joined a ${capitalize(provider as string)} group.`)
                    return
                }

                const group = await getGroup(provider, user.reputation as ReputationLevel)

                if (group) {
                    setGroup(group)

                    setDescription(
                        `The ${user.reputation} ${capitalize(provider as string)} group has ${
                            group.size
                        } members. Follow the steps below to join it.`
                    )
                    setCurrentStep(1)
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const step1 = useCallback(
        async (signer: Signer, group: Group) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, group.provider)

            if (identityCommitment) {
                if (await checkIdentityCommitment(identityCommitment, group.provider, group.name)) {
                    setIdentityCommitment(identityCommitment)
                    setCurrentStep(2)
                }
            }
        },
        [retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step2 = useCallback(
        async (group: Group, identityCommitment: string, web2AccountId: string) => {
            if (await joinGroup(identityCommitment, group.provider, group.name, { web2AccountId })) {
                setCurrentStep(0)
                setDescription("")
            }
        },
        [joinGroup]
    )

    return !session || (_loading && _currentStep === 0) ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : (
        <>
            <Text fontWeight="semibold">{_description}</Text>

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Create your Semaphore identity."
                    actionText="Create Identity"
                    actionFunction={() => step1(_signer as Signer, _group as Group)}
                    loading={_currentStep === 1 && _loading}
                    disabled={_currentStep !== 1}
                />
                <Step
                    title="Step 2"
                    message={`Join the ${session.user.reputation} ${capitalize(session.provider as string)} group.`}
                    actionText="Join Group"
                    actionFunction={() =>
                        step2(_group as Group, _identityCommitment as string, session.web2AccountId as string)
                    }
                    loading={_currentStep === 2 && _loading}
                    disabled={_currentStep !== 2}
                />
            </VStack>
        </>
    )
}
