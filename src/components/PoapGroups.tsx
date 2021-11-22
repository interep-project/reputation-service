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
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const { getGroup } = useInterRepAPI()
    const {
        signMessage,
        retrieveIdentityCommitment,
        checkIdentityCommitment,
        joinGroup,
        leaveGroup,
        _loading
    } = useGroups()

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
                const hasJoined = await checkIdentityCommitment(identityCommitment, Web3Provider.POAP, group.name)

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setCurrentStep(3)
                setHasJoined(hasJoined)
            }
        },
        [retrieveIdentityCommitment, checkIdentityCommitment]
    )

    const step3 = useCallback(
        async (signer: Signer, userAddress: string, group: Group, identityCommitment: string, hasJoined: boolean) => {
            const userSignature = await signMessage(signer, identityCommitment)

            if (userSignature) {
                if (
                    !hasJoined &&
                    (await joinGroup(identityCommitment, Web3Provider.POAP, group.name, { userAddress, userSignature }))
                ) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                } else if (
                    await leaveGroup(identityCommitment, Web3Provider.POAP, group.name, { userAddress, userSignature })
                ) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                }
            }
        },
        [joinGroup, leaveGroup, signMessage]
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
                {_hasJoined !== undefined && (
                    <Step
                        title="Step 3"
                        message={`${!_hasJoined ? "Join" : "Leave"} our Semaphore group.`}
                        actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                        actionFunction={() =>
                            step3(
                                _signer as Signer,
                                _address as string,
                                _group as Group,
                                _identityCommitment as string,
                                _hasJoined
                            )
                        }
                        loading={_currentStep === 3 && _loading}
                        disabled={_currentStep !== 3}
                    />
                )}
            </VStack>
        </>
    )
}
