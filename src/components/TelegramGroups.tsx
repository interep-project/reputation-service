import { useToast, VStack } from "@chakra-ui/react"
import semethid from "@interrep/semethid"
import { Signer } from "ethers"
import React, { useContext, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useInterRepAPI from "src/hooks/useInterRepAPI"
import { Provider } from "src/types/groups"
import capitalize from "src/utils/common/capitalize"

type Properties = {
    userId: string
    groupId: string
}

export default function TelegramGroups({ userId, groupId }: Properties): JSX.Element {
    const toast = useToast()
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_loading, setLoading] = useState<boolean>(false)
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const { checkIdentityCommitment, addIdentityCommitment } = useInterRepAPI()

    async function retrieveIdentityCommitment(signer: Signer, provider: Provider): Promise<string | null> {
        try {
            return await semethid((message) => signer.signMessage(message), capitalize(provider))
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function retrieveAndCheckIdentityCommitment(signer: Signer): Promise<void> {
        setLoading(true)

        const identityCommitment = await retrieveIdentityCommitment(signer, "telegram")

        if (!identityCommitment) {
            toast({
                description: "Your signature is needed to create the identity commitment.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        const alreadyExist = await checkIdentityCommitment({
            provider: "telegram",
            groupName: groupId,
            identityCommitment
        })

        if (alreadyExist === null) {
            setLoading(false)
            return
        }

        if (alreadyExist) {
            toast({
                description: `You already joined this group.`,
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        setIdentityCommitment(identityCommitment)
        setLoading(false)
        setCurrentStep(2)
    }

    async function joinGroup(): Promise<void> {
        setLoading(true)

        const rootHash = await addIdentityCommitment({
            provider: "telegram",
            groupName: groupId,
            identityCommitment: _identityCommitment as string,
            telegramUserId: userId
        })

        if (rootHash === null) {
            setLoading(false)
            return
        }

        setLoading(false)
        setCurrentStep(0)
        toast({
            description: "You joined the Telegram group correctly.",
            variant: "subtle",
            isClosable: true
        })
    }

    return (
        <VStack mt="10px" spacing={4} align="left">
            <Step
                title="Step 1"
                message="Generate your Semaphore identity."
                actionText="Generate Identity"
                actionFunction={() => retrieveAndCheckIdentityCommitment(_signer as Signer)}
                loading={_currentStep === 1 && _loading}
                disabled={_currentStep !== 1}
            />
            <Step
                title="Step 2"
                message="Join the selected group."
                actionText="Join Group"
                actionFunction={() => joinGroup()}
                loading={_currentStep === 2 && _loading}
                disabled={_currentStep !== 2}
            />
        </VStack>
    )
}
