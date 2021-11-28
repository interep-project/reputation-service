import { VStack, Text, Spinner } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"

type Properties = {
    userId: string
    groupId: string
}

export default function TelegramGroups({ userId, groupId }: Properties): JSX.Element {
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const [_groupSize, setGroupSize] = useState<number>(0)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const {
        retrieveIdentityCommitment,
        checkIdentityCommitment,
        getGroup,
        joinGroup,
        leaveGroup,
        _loading
    } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (_currentStep === 0) {
                const group = await getGroup("telegram", groupId)

                if (group) {
                    setGroupSize(group.size)
                    setCurrentStep(1)
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const step1 = useCallback(
        async (signer: Signer, groupId: string) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "telegram")

            if (identityCommitment) {
                const hasJoined = await checkIdentityCommitment(identityCommitment, "telegram", groupId)

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setCurrentStep(2)
                setHasJoined(hasJoined)
            }
        },
        [retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step2 = useCallback(
        async (identityCommitment: string, groupId: string, userId: string, hasJoined: boolean) => {
            if (!hasJoined) {
                if (await joinGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId })) {
                    setHasJoined(true)
                    setGroupSize((v) => v + 1)
                }
            } else if (await leaveGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId })) {
                setHasJoined(false)
                setGroupSize((v) => v - 1)
            }
        },
        [joinGroup, leaveGroup]
    )

    return _loading && _currentStep === 0 ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : (
        <>
            <Text fontWeight="semibold">
                This Telegram group has {_groupSize} members. Follow the steps below to join/leave it.
            </Text>

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Generate your Semaphore identity."
                    actionText="Generate Identity"
                    actionFunction={() => step1(_signer as Signer, groupId)}
                    loading={_currentStep === 1 && _loading}
                    disabled={_currentStep !== 1}
                />
                {_hasJoined !== undefined && (
                    <Step
                        title="Step 2"
                        message={`${!_hasJoined ? "Join" : "Leave"} our Telegram Semaphore group.`}
                        actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                        actionFunction={() => step2(_identityCommitment as string, groupId, userId, _hasJoined)}
                        loading={_currentStep === 2 && _loading}
                        disabled={_currentStep !== 2}
                    />
                )}
            </VStack>
        </>
    )
}
