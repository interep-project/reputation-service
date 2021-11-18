import { VStack } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"

type Properties = {
    userId: string
    groupId: string
    join: boolean
}

export default function TelegramGroups({ userId, groupId, join = true }: Properties): JSX.Element {
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const { retrieveIdentityCommitment, checkIdentityCommitment, joinGroup, leaveGroup, _loading } = useGroups()

    const step1 = useCallback(
        async (signer: Signer, groupId: string, join: boolean) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "telegram")

            if (identityCommitment) {
                if (await checkIdentityCommitment(identityCommitment, "telegram", groupId, join)) {
                    setIdentityCommitment(identityCommitment)
                    setCurrentStep(2)
                }
            }
        },
        [retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step2 = useCallback(
        async (identityCommitment: string, groupId: string, userId: string, join: boolean) => {
            if (join && (await joinGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId }))) {
                setCurrentStep(0)
            } else if (await leaveGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId })) {
                setCurrentStep(0)
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
                actionFunction={() => step1(_signer as Signer, groupId, join)}
                loading={_currentStep === 1 && _loading}
                disabled={_currentStep !== 1}
            />
            <Step
                title="Step 2"
                message={`${join ? "Join" : "Leave"} our Semaphore group.`}
                actionText={`${join ? "Join" : "Leave"} Group`}
                actionFunction={() => step2(_identityCommitment as string, groupId, userId, join)}
                loading={_currentStep === 2 && _loading}
                disabled={_currentStep !== 2}
            />
        </VStack>
    )
}
