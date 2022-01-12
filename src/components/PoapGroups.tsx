import { Spinner, Text, VStack } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { providers, Signer } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import Step from "src/components/Step"
import { PoapEvent } from "src/core/poap"
import useGroups from "src/hooks/useGroups"
import usePoapEvents from "src/hooks/usePoapEvents"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function PoapGroups(): JSX.Element {
    const { account, library } = useWeb3React<providers.Web3Provider>()
    const { getPoapEvents } = usePoapEvents()
    const [_identityCommitment, setIdentityCommitment] = useState<string>()
    const [_group, setGroup] = useState<Group>()
    const [_currentStep, setCurrentStep] = useState<number>(0)
    const [_hasJoined, setHasJoined] = useState<boolean>()
    const [_poapEvents, setPoapEvents] = useState<string[]>()
    const [_signer, setSigner] = useState<Signer>()
    const {
        signMessage,
        retrieveIdentityCommitment,
        hasIdentityCommitment,
        joinGroup,
        leaveGroup,
        getGroup,
        _loading
    } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (account && library) {
                setSigner(library.getSigner(account))

                if (_currentStep === 0) {
                    const poapEvents = await getPoapEvents(account)

                    if (poapEvents) {
                        setPoapEvents(poapEvents)
                    }

                    setCurrentStep(1)
                }
            }
        })()
    }, [account, library, _currentStep, getPoapEvents])

    const step1 = useCallback(
        async (groupName: PoapEvent) => {
            const group = await getGroup("poap", groupName)

            if (group) {
                setGroup(group)
                setCurrentStep(2)
            }
        },
        [getGroup]
    )

    const step2 = useCallback(
        async (signer: Signer, group: Group) => {
            const identityCommitment = await retrieveIdentityCommitment(signer, "poap")

            if (identityCommitment) {
                const hasJoined = await hasIdentityCommitment(identityCommitment, "poap", group.name)

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
                        await joinGroup(identityCommitment, "poap", group.name, {
                            userAddress,
                            userSignature
                        })
                    ) {
                        setCurrentStep(1)
                        setHasJoined(undefined)
                        setGroup(undefined)
                    }
                } else if (await leaveGroup(identityCommitment, "poap", group.name, { userAddress, userSignature })) {
                    setCurrentStep(1)
                    setHasJoined(undefined)
                    setGroup(undefined)
                }
            }
        },
        [joinGroup, leaveGroup, signMessage]
    )

    return _currentStep === 0 ? (
        <VStack h="300px" align="center" justify="center">
            <Spinner thickness="4px" speed="0.65s" size="xl" />
        </VStack>
    ) : _poapEvents && _poapEvents.length === 0 ? (
        <VStack h="250px" align="center" justify="center">
            <Text fontSize="lg">Sorry, you don&#39;t own any of the POAP tokens supported by InterRep!</Text>
        </VStack>
    ) : (
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
                                account as string,
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
