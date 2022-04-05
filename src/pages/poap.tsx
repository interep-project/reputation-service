import {
    Box,
    Container,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Text,
    VStack
} from "@chakra-ui/react"
import { Step, Steps, useSteps } from "chakra-ui-steps"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { GoSearch } from "react-icons/go"
import { GroupBox, GroupBoxButton, GroupBoxHeader, GroupBoxContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import usePoapEvents from "src/hooks/usePoapEvents"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function PoapProviderPage(): JSX.Element {
    const { _account, _identityCommitment } = useContext(EthereumWalletContext)
    const { activeStep, setStep } = useSteps({
        initialStep: 0
    })
    const { getPoapEvents } = usePoapEvents()
    const [_poapGroups, setPoapGroups] = useState<Group[]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("1")

    const { getGroups } = useGroups()

    useEffect(() => {
        if (!_account) {
            setStep(0)
        } else if (!_identityCommitment) {
            setStep(1)
        } else {
            setStep(2)
        }
    }, [_account, _identityCommitment, setStep])

    useEffect(() => {
        ;(async () => {
            if (_account) {
                const poapEvents = await getPoapEvents(_account)

                if (poapEvents) {
                    const groups = await getGroups()

                    if (groups) {
                        const poapGroups = groups.filter((g) => poapEvents.includes(g.name))

                        setPoapGroups(poapGroups)
                    }
                }
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_account])

    const sortCb = useCallback(
        (poapGroupA: Group, poapGroupB: Group) => {
            switch (_sortingValue) {
                case "2":
                    return poapGroupA.name.localeCompare(poapGroupB.name)
                case "3":
                    return poapGroupB.name.localeCompare(poapGroupA.name)
                case "1":
                default:
                    return poapGroupA.size - poapGroupB.size
            }
        },
        [_sortingValue]
    )

    const filterCb = useCallback(
        (poapGroup: Group) => !_searchValue || poapGroup.name.includes(_searchValue.toLowerCase()),
        [_searchValue]
    )

    return (
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.xl">
            <HStack mb="6" spacing="6">
                <VStack align="left">
                    <Heading as="h3" size="lg" mb="2">
                        Anonymous on-chain authentication
                    </Heading>

                    <Text color="background.400" fontSize="md">
                        If your connected wallet contains POAPs they will appear below. Generate a semaphore ID to get
                        started anonymously joining POAP groups.
                    </Text>
                </VStack>
                <Box bg="background.800" borderRadius="4px" h="180" w="700px" />
            </HStack>

            <Steps activeStep={activeStep} colorScheme="background" size="sm" py="4">
                <Step label="Connect wallet" />
                <Step label="Generate Semaphore ID" />
                <Step label="Join POAP groups" />
            </Steps>

            <HStack justify="space-between" my="6">
                <InputGroup maxWidth="250px">
                    <InputLeftElement pointerEvents="none">
                        <GoSearch color="gray" />
                    </InputLeftElement>
                    <Input
                        colorScheme="primary"
                        placeholder="Search"
                        value={_searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </InputGroup>

                <Select
                    value={_sortingValue}
                    onChange={(event) => setSortingValue(event.target.value)}
                    maxWidth="250px"
                >
                    <option value="1">Most members</option>
                    <option value="2">A-Z</option>
                    <option value="3">Z-A</option>
                </Select>
            </HStack>

            {_poapGroups ? (
                _poapGroups.length > 0 ? (
                    <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                        {_poapGroups
                            .sort(sortCb)
                            .filter(filterCb)
                            .map((group, i) => (
                                <GroupBox key={i.toString()}>
                                    <GroupBoxHeader title={capitalize(group.name)} />
                                    <GroupBoxContent group={group} />
                                    <GroupBoxButton onClick={() => console.log("Join")} disabled={!_account}>
                                        Join
                                    </GroupBoxButton>
                                </GroupBox>
                            ))}
                    </SimpleGrid>
                ) : (
                    <VStack justify="center" pt="80px">
                        <Heading as="h3" size="lg" mb="10px">
                            Nothing to see here
                        </Heading>

                        <Text color="background.400" fontSize="md" mb="30px">
                            The connected wallet does not contain any POAPs.
                        </Text>
                    </VStack>
                )
            ) : (
                <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                    {[0, 1, 2].map((i) => (
                        <Skeleton
                            key={i.toString()}
                            startColor="background.800"
                            endColor="background.700"
                            borderRadius="4px"
                            height="318px"
                        />
                    ))}
                </SimpleGrid>
            )}
        </Container>
    )
}
