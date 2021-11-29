import { VStack, Text, Spinner } from "@chakra-ui/react"
import { Signer } from "ethers"
import React, { useCallback, useContext, useEffect, useState } from "react"
import Step from "src/components/Step"
import EthereumWalletContext, { EthereumWalletContextType } from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import { Group, Web3Provider } from "src/types/groups"

type Properties = {
    userId: string
    userToken: string
    groupId: string
}

export default function EmailGroups({ userId, userToken, groupId }: Properties): JSX.Element {
    const { _signer } = useContext(EthereumWalletContext) as EthereumWalletContextType
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_currentStep, setCurrentStep] = useState<number>(1)
    const [_groupSize, setGroupSize] = useState<number>(0)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_group, setGroup] = useState<Group>()

    const group_list = groupId.split("+")

    const {
        retrieveIdentityCommitment,
        checkIdentityCommitment,
        getGroup,
        joinGroup,
        leaveGroup,
        _loading
    } = useGroups()

    // useEffect(() => {
    //     ;(async () => {
    //         const group = await getGroup("email", groupId)

    //         if (group) {
    //             setGroupSize(group.size)
    //             setCurrentStep(1)
    //         }
    //     })()
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    const step1 = useCallback(
        async (groupName: string) => {
            const group = await getGroup("email", groupName)

            if (group) {
                setGroup(group)
                setCurrentStep(2)
            }
        },
        [getGroup]
    )

    const step2 = useCallback(
        async (signer: Signer, group: Group) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "email")

            if (identityCommitment) {
                const hasJoined = await checkIdentityCommitment(identityCommitment, "email", group.name)

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
        async (identityCommitment: string, group: Group, userId: string, userToken: string, hasJoined: boolean) => {
            if (!hasJoined) {
                if (
                    await joinGroup(identityCommitment, "email", group.name, {
                        emailUserId: userId,
                        emailUserToken: userToken
                    })
                ) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                    setGroup(undefined)
                }
            } else if (
                await leaveGroup(identityCommitment, "email", group.name, {
                    emailUserId: userId,
                    emailUserToken: userToken
                })
            ) {
                setCurrentStep(1)
                setHasJoined(undefined)
                setGroup(undefined)
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
            {_group && (
                <Text fontWeight="semibold">
                    The {_group.name} Email group has {_group.size} members. Follow the steps below to join/leave it.
                </Text>
            )}

            <VStack mt="20px" spacing={4} align="left">
                <Step
                    title="Step 1"
                    message="Select an Email group."
                    actionText="Select Group"
                    actionFunction={(groupName) => step1(groupName)}
                    actionType="select"
                    selectOptions={group_list}
                    selectOptionFilter={(option) => option as string}
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
                        message={`${!_hasJoined ? "Join" : "Leave"} our Email Semaphore group.`}
                        actionText={`${!_hasJoined ? "Join" : "Leave"} Group`}
                        actionFunction={() =>
                            step3(_identityCommitment as string, _group as Group, userId, userToken, _hasJoined)
                        }
                        loading={_currentStep === 3 && _loading}
                        disabled={_currentStep !== 3}
                    />
                )}
            </VStack>
        </>
    )
}
