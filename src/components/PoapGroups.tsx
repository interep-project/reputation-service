import { Spinner, useToast, VStack } from "@chakra-ui/react"
import semethid from "@interrep/semethid"
import { Signer } from "ethers"
import React, { useCallback, useContext, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { getPoapEventName, PoapGroupName } from "src/core/groups/poap"
import { Group, Provider, Web3Provider } from "src/types/groups"
import { addIdentityCommitment, checkIdentityCommitment, getGroup } from "src/utils/frontend/api"
import capitalize from "src/utils/common/capitalize"

export default function PoapGroups(): JSX.Element {
    const toast = useToast()
    const { _signer, _poapGroupNames, _address } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_loading, setLoading] = useState<boolean>(false)
    const [_group, setGroup] = useState<Group | null>(null)
    const [_currentStep, setCurrentStep] = useState<number>(1)

    const showUnexpectedError = useCallback(() => {
        toast({
            description: "Sorry, there was an unexpected error.",
            variant: "subtle",
            status: "error"
        })
        setLoading(false)
    }, [toast])

    const selectGroup = useCallback(
        async (groupName: PoapGroupName) => {
            const group = await getGroup({ provider: Web3Provider.POAP, name: groupName })

            if (group === null) {
                showUnexpectedError()
                return
            }

            setGroup(group)
            toast({
                description: `The selected POAP group has ${group.size} ${group.size === 1 ? "member" : "members"}.`,
                variant: "subtle",
                isClosable: true
            })
            setCurrentStep(2)
        },
        [toast, showUnexpectedError]
    )

    async function sign(signer: Signer, message: string): Promise<string | null> {
        try {
            return await signer.signMessage(message)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function retrieveIdentityCommitment(signer: Signer, provider: Provider): Promise<string | null> {
        try {
            return await semethid((message) => signer.signMessage(message), capitalize(provider))
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function retrieveAndCheckIdentityCommitment(signer: Signer, group: Group): Promise<void> {
        setLoading(true)

        const identityCommitment = await retrieveIdentityCommitment(signer, group.provider)

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
            provider: group.provider,
            name: group.name as PoapGroupName,
            identityCommitment
        })

        if (alreadyExist === null) {
            showUnexpectedError()
            return
        }

        if (alreadyExist) {
            toast({
                description: `You already joined this group.`,
                variant: "subtle",
                isClosable: true
            })
            setCurrentStep(1)
            setLoading(false)
            return
        }

        setIdentityCommitment(identityCommitment)
        setLoading(false)
        setCurrentStep(3)
    }

    async function joinGroup(signer: Signer, group: Group): Promise<void> {
        setLoading(true)

        const userSignature = await sign(signer, _identityCommitment as string)

        if (!userSignature) {
            toast({
                description: "The identity signature is needed to join the group.",
                variant: "subtle",
                isClosable: true
            })
            setLoading(false)
            return
        }

        const rootHash = await addIdentityCommitment({
            provider: group.provider,
            name: group.name as PoapGroupName,
            identityCommitment: _identityCommitment as string,
            userAddress: _address as string,
            userSignature
        })

        if (rootHash === null) {
            showUnexpectedError()
            return
        }

        setLoading(false)
        setCurrentStep(1)
        toast({
            description: "You joined the POAP group correctly.",
            variant: "subtle",
            isClosable: true
        })
    }

    return !_poapGroupNames.length ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : (
        <>
            <VStack mt="10px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Select a POAP group."
                    actionText="Select Group"
                    actionFunction={(groupName) => selectGroup(groupName)}
                    actionType="select"
                    selectOptions={_poapGroupNames}
                    selectOptionFilter={(option) => getPoapEventName(option as PoapGroupName)}
                    loading={_currentStep === 1 && _loading}
                    disabled={_currentStep !== 1}
                />
                <Step
                    title="Step 2"
                    message="Generate your Semaphore identity."
                    actionText="Generate Identity"
                    actionFunction={() => retrieveAndCheckIdentityCommitment(_signer as Signer, _group as Group)}
                    loading={_currentStep === 2 && _loading}
                    disabled={_currentStep !== 2}
                />
                <Step
                    title="Step 3"
                    message="Join the selected group."
                    actionText="Join Group"
                    actionFunction={() => joinGroup(_signer as Signer, _group as Group)}
                    loading={_currentStep === 3 && _loading}
                    disabled={_currentStep !== 3}
                />
            </VStack>
        </>
    )
}
