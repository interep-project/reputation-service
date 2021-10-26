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
    const { retrieveIdentityCommitment, checkIdentityCommitment, joinGroup, _loading } = useGroups()

    const step1 = useCallback(
        async (signer: Signer) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "telegram")

            if (identityCommitment) {
                if (await checkIdentityCommitment(identityCommitment, "telegram", groupId)) {
                    setIdentityCommitment(identityCommitment)
                    setCurrentStep(2)
                }
            }
        },
        [groupId, retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step2 = useCallback(
        async (identityCommitment: string) => {
            if (await joinGroup(identityCommitment, "telegram", groupId, { telegramUserId: userId })) {
                setCurrentStep(0)
            }
        },
        [groupId, userId, joinGroup]
    )

    return (
        <VStack mt="10px" spacing={4} align="left">
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
    )
}
