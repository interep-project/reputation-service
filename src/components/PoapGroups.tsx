import { Text, VStack } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import { PoapEvent } from "src/core/poap"
import useGroups from "src/hooks/useGroups"
import { Group, Web3Provider } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function PoapGroups(): JSX.Element {
    const { _signer, _poapEvents, _address } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_group, setGroup] = useState<Group>()
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const {
        signMessage,
        retrieveIdentityCommitment,
        hasIdentityCommitment,
        joinGroup,
        leaveGroup,
        getGroup,
        _loading
    } = useGroups()

    const step1 = useCallback(
        async (groupName: PoapEvent) => {
            const group = await getGroup(Web3Provider.POAP, groupName)

            if (group) {
                setGroup(group)
                setCurrentStep(2)
            }
        },
        [getGroup]
    )

    const step2 = useCallback(
        async (signer: Signer, group: Group) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, Web3Provider.POAP)

            if (identityCommitment) {
                const hasJoined = await hasIdentityCommitment(identityCommitment, Web3Provider.POAP, group.name)

                if (hasJoined === null) {
                    return
                }

                setIdentityCommitment(identityCommitment)
                setCurrentStep(3)
                setHasJoined(hasJoined)
            }
        },
        [retrieveIdentityCommitment, hasIdentityCommitment]
    )

    const step3 = useCallback(
        async (signer: Signer, userAddress: string, group: Group, identityCommitment: string, hasJoined: boolean) => {
            const userSignature = await signMessage(signer, identityCommitment)

            if (userSignature) {
                if (!hasJoined) {
                    if (
                        await joinGroup(identityCommitment, Web3Provider.POAP, group.name, {
                            userAddress,
                            userSignature
                        })
                    ) {
                        setCurrentStep(1)
                        setHasJoined(undefined)
                        setGroup(undefined)
                    }
                } else if (
                    await leaveGroup(identityCommitment, Web3Provider.POAP, group.name, { userAddress, userSignature })
                ) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                    setGroup(undefined)
                }
            }
        },
        [joinGroup, leaveGroup, signMessage]
    )

    return (
        <>
            {_group && (
                <Text fontWeight="semibold">
                    The {_group.name} POAP group has {_group.size} members. Follow the steps below to join/leave it.
                </Text>
            )}

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Select a POAP group."
                    actionText="Select Group"
                    actionFunction={(groupName) => step1(groupName)}
                    actionType="select"
                    selectOptions={_poapEvents}
                    selectOptionFilter={(option) => capitalize(option)}
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
                        message={`${!_hasJoined ? "Join" : "Leave"} our POAP Semaphore group.`}
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
