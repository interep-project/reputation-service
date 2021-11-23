import { VStack, Text, Spinner } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"

type Properties = {
    userId: string
    userToken: string
    groupId: string
}

export default function EmailGroups({ userId, userToken, groupId }: Properties): JSX.Element {
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const [_groupSize, setGroupSize] = useState<number>(0)
    const { retrieveIdentityCommitment, checkIdentityCommitment, getGroup, joinGroup, _loading } = useGroups()

    useEffect(() => {
        ;(async () => {
            const group = await getGroup("email", groupId)

            if (group) {
                setGroupSize(group.size)
                setCurrentStep(1)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const step1 = useCallback(
        async (signer: Signer) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "email")

            if (identityCommitment) {
                const hasJoined = await checkIdentityCommitment(identityCommitment, "email", groupId)

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setCurrentStep(2)
            }
        },
        [groupId, retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step2 = useCallback(
        async (identityCommitment: string) => {
            if (
                await joinGroup(identityCommitment, "email", groupId, {
                    emailUserId: userId,
                    emailUserToken: userToken
                })
            ) {
                setCurrentStep(0)
                setGroupSize((v) => v + 1)
            }
        },
        [groupId, userId, userToken, joinGroup]
    )

    return _loading && _currentStep === 0 ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : (
        <>
            <Text fontWeight="semibold">
                This Email group has {_groupSize} members. Follow the steps below to join/leave it.
            </Text>

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Generate your Semaphore identity."
                    actionText="Generate Identity"
                    actionFunction={() => step1(_signer as Signer)}
                    loading={_currentStep === 1 && _loading}
                    disabled={_currentStep !== 1}
                />
                <Step
                    title="Step 2"
                    message="Join the selected group."
                    actionText="Join Group"
                    actionFunction={() => step2(_identityCommitment as string)}
                    loading={_currentStep === 2 && _loading}
                    disabled={_currentStep !== 2}
                />
            </VStack>
        </>
    )
}
