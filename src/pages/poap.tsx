import {
    Container,
    Divider,
    Heading,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Skeleton,
    Text
} from "@chakra-ui/react"
import React, { useCallback, useContext, useEffect, useState } from "react"
import { GoSearch } from "react-icons/go"
import { GroupBox, GroupBoxPoapContent } from "src/components/group-box"
import EthereumWalletContext from "src/context/EthereumWalletContext"
import useGroups from "src/hooks/useGroups"
import usePoapEvents from "src/hooks/usePoapEvents"
import { Group } from "src/types/groups"
import { capitalize } from "src/utils/common"

export default function PoapProvider(): JSX.Element {
    const { _account } = useContext(EthereumWalletContext)
    const { getPoapEvents } = usePoapEvents()
    const [_poapGroups, setPoapGroups] = useState<Group[]>()
    const [_searchValue, setSearchValue] = useState<string>("")
    const [_sortingValue, setSortingValue] = useState<string>("1")

    const { getGroups } = useGroups()

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
        <Container flex="1" mb="80px" mt="160px" px="80px" maxW="container.lg">
            <Heading as="h2" size="xl" mb="10px">
                Authenticate anonymously on-chain using off-chain reputation.
            </Heading>

            <Text color="background.400" fontSize="md" mb="30px">
                To join Social network groups you will need to authorize each provider individually to share your
                credentials with Interep. Groups can be left at any time.
            </Text>

            <Divider />

            <HStack justify="space-between" my="30px">
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
                <SimpleGrid columns={{ sm: 2, md: 3 }} spacing={5}>
                    {_poapGroups
                        .sort(sortCb)
                        .filter(filterCb)
                        .map((group, i) => (
                            <GroupBox
                                key={i.toString()}
                                title={capitalize(group.name)}
                                content={<GroupBoxPoapContent groupSize={group.size} />}
                                actionText="Join"
                                actionFunction={() => console.log("Join")}
                                disabled={!_account}
                            />
                        ))}
                </SimpleGrid>
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
