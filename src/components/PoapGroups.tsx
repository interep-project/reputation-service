import { Spinner, useToast, VStack } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { getPoapEventName, PoapGroupName } from "src/core/groups/poap"
import useGroups from "src/hooks/useGroups"
import useInterRepAPI from "src/hooks/useInterRepAPI"
import { Group, Web3Provider } from "src/types/groups"

export default function PoapGroups(): JSX.Element {
    const toast = useToast()
    const { _signer, _poapGroupNames, _address } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_group, setGroup] = useState<Group | null>(null)
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const { getGroup } = useInterRepAPI()
    const { signMessage, retrieveIdentityCommitment, checkIdentityCommitment, joinGroup, _loading } = useGroups()

    const step1 = useCallback(
        async (groupName: PoapGroupName) => {
            const group = await getGroup({ provider: Web3Provider.POAP, groupName })

            if (group === null) {
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
        [toast, getGroup]
    )

    const step2 = useCallback(
        async (signer: Signer, group: Group) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, Web3Provider.POAP)

            if (identityCommitment) {
                if (await checkIdentityCommitment(identityCommitment, Web3Provider.POAP, group.name)) {
                    setIdentityCommitment(identityCommitment)
                    setCurrentStep(3)
                }
            }
        },
        [retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step3 = useCallback(
        async (signer: Signer, userAddress: string, group: Group, identityCommitment: string) => {
            const userSignature = await signMessage(signer, identityCommitment)

            if (userSignature) {
                if (
                    await joinGroup(identityCommitment, Web3Provider.POAP, group.name, { userAddress, userSignature })
                ) {
                    setCurrentStep(0)
                }
            }
        },
        [joinGroup, signMessage]
    )

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
                    actionFunction={(groupName) => step1(groupName)}
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
                    actionFunction={() => step2(_signer as Signer, _group as Group)}
                    loading={_currentStep === 2 && _loading}
                    disabled={_currentStep !== 2}
                />
                <Step
                    title="Step 3"
                    message="Join the selected group."
                    actionText="Join Group"
                    actionFunction={() =>
                        step3(_signer as Signer, _address as string, _group as Group, _identityCommitment as string)
                    }
                    loading={_currentStep === 3 && _loading}
                    disabled={_currentStep !== 3}
                />
            </VStack>
        </>
    )
}
