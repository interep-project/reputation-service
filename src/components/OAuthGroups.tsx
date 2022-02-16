import { Spinner, Text, VStack } from "@chakra-ui/react"
import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { useWeb3React } from "@web3-react/core"
import { providers, Signer } from "ethers"
import { useSession } from "next-auth/client"
import { useCallback, useEffect, useState } from "react"
import Step from "src/components/Step"
import useGroups from "src/hooks/useGroups"
import { capitalize } from "src/utils/common"

export default function OAuthGroups(): JSX.Element {
    const [session] = useSession()
    const { account, library } = useWeb3React<providers.Web3Provider>()
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_groupSize, setGroupSize] = useState<number>(0)
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_signer, setSigner] = useState<Signer>()
    const { retrieveIdentityCommitment, hasIdentityCommitment, joinGroup, leaveGroup, getGroup, _loading } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (account && library) {
                setSigner(library.getSigner(account))

                if (session && _currentStep === 0) {
                    const { provider, user } = session
                    const group = await getGroup(provider, user.reputation as ReputationLevel)

                    if (group) {
                        setGroupSize(group.size)
                        setCurrentStep(1)
                    }
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, account, library])

    const step1 = useCallback(
        async (signer: Signer, provider: OAuthProvider, reputation: ReputationLevel) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, provider)

            if (identityCommitment) {
                const hasJoined = await hasIdentityCommitment(identityCommitment, provider, reputation, true)

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setCurrentStep(2)
                setHasJoined(hasJoined)
            }
        },
        [retrieveIdentityCommitment, hasIdentityCommitment]
    )

    const step2 = useCallback(
        async (
            provider: OAuthProvider,
            reputation: ReputationLevel,
            identityCommitment: string,
            accountId: string,
            hasJoined: boolean
        ) => {
            if (!hasJoined) {
                if (await joinGroup(identityCommitment, provider, reputation, { accountId })) {
                    setHasJoined(true)
                    setGroupSize((v) => v + 1)
                }
            } else if (await leaveGroup(identityCommitment, provider, reputation, { accountId })) {
                setHasJoined(false)
                setGroupSize((v) => v - 1)
            }
        },
        [joinGroup, leaveGroup]
    )

    return !session || (_loading && _currentStep === 0) ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : (
        <>
            <Text fontWeight="semibold">
                The {session.user.reputation} {capitalize(session.provider as string)} group has {_groupSize} members.
                Follow the steps below to join/leave it.
            </Text>

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Generate your Semaphore identity."
                    actionText="Generate Identity"
                    actionFunction={() =>
                        step1(_signer as Signer, session.provider, session.user.reputation as ReputationLevel)
                    }
                    loading={_currentStep === 1 && _loading}
                    disabled={_currentStep !== 1}
                />
                {_hasJoined !== undefined && (
                    <Step
                        title="Step 2"
                        message={`${!_hasJoined ? "Join" : "Leave"} our ${capitalize(
                            session.provider as string
                        )} Semaphore group.`}
                        actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                        actionFunction={() =>
                            step2(
                                session.provider,
                                session.user.reputation as ReputationLevel,
                                _identityCommitment as string,
                                session.accountId as string,
                                _hasJoined
                            )
                        }
                        loading={_currentStep === 2 && _loading}
                        disabled={_currentStep !== 2}
                    />
                )}
            </VStack>
        </>
    )
}
