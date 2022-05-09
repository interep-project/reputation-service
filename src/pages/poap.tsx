import {
    Container,
    Heading,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { GoSearch } from "react-icons/go"
import { GroupBox, GroupBoxButton, GroupBoxContent, GroupBoxHeader } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import usePoapEvents from "src/hooks/usePoapEvents"
import { UserGroup } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function PoapProviderPage(): JSX.Element {
    const { _account, _identityCommitment, signMessage } = useContext(EthereumWalletContext)
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { getPoapEvents } = usePoapEvents()
    const [_poapGroups, setPoapGroups] = useState<UserGroup[]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("2")
    const { getGroups, joinGroup, hasIdentityCommitment } = useGroups()

    useEffect(() => {
        ;(async () => {
            if (_account && _identityCommitment) {
                const poapEvents = await getPoapEvents(_account)

                if (poapEvents) {
                    const groups = await getGroups()

                    if (groups) {
                        const poapGroups = []

                        for (const group of groups) {
                            if (poapEvents.includes(group.name)) {
                                poapGroups.push({
                                    ...group,
                                    joined: await hasIdentityCommitment(_identityCommitment, "poap", group.name)
                                })
                            }
                        }

                        setPoapGroups(poapGroups)
                    }
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_account, _identityCommitment])

    useEffect(() => {
        if (!_identityCommitment) {
            setStep(0)
        } else {
            setStep(1)
        }
    }, [_account, _identityCommitment, setStep])

    const sortCb = useCallback(
        (groupA: UserGroup, groupB: UserGroup) => {
            switch (_sortingValue) {
                case "2":
                    return groupA.name.localeCompare(groupB.name)
                case "3":
                    return groupB.name.localeCompare(groupA.name)
                case "1":
                default:
                    return groupB.size - groupA.size
            }
        },
        [_sortingValue]
    )

    const filterCb = useCallback(
        (group: UserGroup) => !_searchValue || group.name.includes(_searchValue.toLowerCase()),
        [_searchValue]
    )

    const join = useCallback(
        async (group: UserGroup) => {
            if (_account && _identityCommitment) {
                const userSignature = await signMessage(_identityCommitment)

                if (userSignature) {
                    if (
                        await joinGroup(_identityCommitment, "poap", group.name, {
                            userAddress: _account,
                            userSignature
                        })
                    ) {
                        group.size += 1
                        group.joined = true

                        setPoapGroups(_poapGroups?.slice())
                    }
                }
            }
        },
        [_identityCommitment, _account, signMessage, joinGroup, _poapGroups]
    )

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <Stack direction={["column", "column", "row"]} spacing="10">
                <VStack flex="1" align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Anonymously prove you where there
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        If your connected wallet contains POAP tokens they will appear below. Generate a semaphore ID to
                        get started joining POAP groups.
                    </Text>
                </VStack>
                <HStack flex="1" justify="center">
                    <Image src="./poap-illustration.svg" alt="POAP illustration" h="150px" />
                </HStack>
            </Stack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" my="12">
                <Step label="Generate Semaphore ID" />
                <Step label="Join POAP groups" />
            </Steps>

            <HStack justify="space-between" mt="80px" mb="10">
                <InputGroup maxWidth="250px">
                    <InputLeftElement pointerEvents="none">
                        <GoSearch color="gray" />
                    </InputLeftElement>
                    <Input
                        colorScheme="primary"
                        focusBorderColor="primary.500"
                        placeholder="Search"
                        value={_searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </InputGroup>

                <Select
                    value={_sortingValue}
                    onChange={(event) => setSortingValue(event.target.value)}
                    maxWidth="250px"
                    focusBorderColor="primary.500"
                >
                    <option value="1">Most members</option>
                    <option value="2">A-Z</option>
                    <option value="3">Z-A</option>
                </Select>
            </HStack>

            {!_account ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to connect your wallet!
                </Text>
            ) : !_identityCommitment ? (
                <Text textAlign="center" color="background.400" fontSize="lg" pt="100px">
                    You need to generate your Semaphore ID!
                </Text>
            ) : _poapGroups ? (
                _poapGroups.length > 0 ? (
                    <SimpleGrid minChildWidth="250px" spacing={5}>
                        {_poapGroups
                            .sort(sortCb)
                            .filter(filterCb)
                            .map((group, i) => (
                                <GroupBox key={i.toString()}>
                                    <GroupBoxHeader title={capitalize(group.name)} joined={!!group.joined} />
                                    <GroupBoxContent group={group} />

                                    <GroupBoxButton
                                        alertTitle="Confirm join"
                                        alertMessage="You will not be able to leave this group after you have joined."
                                        onClick={() => join(group)}
                                        disabled={!_identityCommitment || !!group.joined}
                                    >
                                        Join
                                    </GroupBoxButton>
                                </GroupBox>
                            ))}
                    </SimpleGrid>
                ) : (
                    <Text textAlign="center" color="background.400" fontSize="lg" pt="80px">
                        The connected wallet does not contain any POAP tokens.
                    </Text>
                )
            ) : (
                <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton
                            key={i.toString()}
                            startColor="background.800"
                            endColor="background.700"
                            borderRadius="4px"
                            height="228px"
                        />
                    ))}
                </SimpleGrid>
            )}
        </Container>
    )
}
