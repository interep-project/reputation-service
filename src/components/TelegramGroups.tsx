import { VStack } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useState } from "react"
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
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const { retrieveIdentityCommitment, checkIdentityCommitment, joinGroup, leaveGroup, _loading } = useGroups()

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
            if (!hasJoined && (await joinGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId }))) {
                setCurrentStep(1)
                setHasJoined(undefined)
            } else if (await leaveGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId })) {
                setCurrentStep(1)
                setHasJoined(undefined)
            }
        },
        [joinGroup, leaveGroup]
    )

    return (
        <VStack mt="10px" spacing={4} align="left">
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
                    message={`${!_hasJoined ? "Join" : "Leave"} our Semaphore group.`}
                    actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                    actionFunction={() => step2(_identityCommitment as string, groupId, userId, _hasJoined)}
                    loading={_currentStep === 2 && _loading}
                    disabled={_currentStep !== 2}
                />
            )}
        </VStack>
    )
}
