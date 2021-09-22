import { Web2Provider } from "@interrep/reputation-criteria"
import semethid from "@interrep/semethid"
import { capitalize } from "@material-ui/core"
import { babyJub, poseidon } from "circomlib"
import { Signer } from "ethers"
import React, { useEffect } from "react"
import { Group } from "src/types/groups"
import { DeployedContracts } from "src/utils/crypto/deployedContracts"
import { addIdentityCommitment, checkGroup, checkIdentityCommitment, getGroup } from "src/utils/frontend/api"
import TabPanelContent from "./TabPanelContent"

type Properties = {
    onArrowClick: (direction: -1 | 1) => void
    reputation: string
    signer: Signer
    web2Provider: Web2Provider
    web2AccountId: string
}

export default function SemaphoreGroupTabPanel({
    onArrowClick,
    reputation,
    signer,
    web2Provider,
    web2AccountId
}: Properties): JSX.Element {
    const [_identityCommitment, setIdentityCommitment] = React.useState<string>()
    const [_loading, setLoading] = React.useState<boolean>(false)
    const [_warningMessage, setWarningMessage] = React.useState<string>("")
    const [_error, setError] = React.useState<boolean>(false)
    const [_group, setGroup] = React.useState<Group | null>(null)

    function showUnexpectedError(): void {
        setWarningMessage("Sorry, there was an unexpected error")
        setError(true)
        setLoading(false)
    }

    useEffect(() => {
        ;(async () => {
            setWarningMessage("")
            setLoading(true)

            const hasJoinedAGroup = await checkGroup()

            if (hasJoinedAGroup === null) {
                showUnexpectedError()
                return
            }

            if (hasJoinedAGroup) {
                setLoading(false)
                return
            }

            const group = await getGroup({ groupId: `${web2Provider.toUpperCase()}_${reputation}` })

            setGroup(group)
            setLoading(false)
        })()
    }, [web2Provider, reputation])

    async function retrieveIdentityCommitment(): Promise<string | null> {
        try {
            const identity = await semethid((message) => signer.signMessage(message), capitalize(web2Provider))

            return poseidon([
                babyJub.mulPointEscalar(identity.keypair.pubKey, 8)[0],
                identity.identityNullifier,
                identity.identityTrapdoor
            ]).toString()
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async function retrieveAndCheckIdentityCommitment(groupId: string): Promise<void> {
        setWarningMessage("")
        setLoading(true)

        const identityCommitment = await retrieveIdentityCommitment()

        if (!identityCommitment) {
            setWarningMessage("Your signature is needed to create the identity commitment")
            setLoading(false)
            return
        }

        const alreadyExist = await checkIdentityCommitment({
            groupId,
            identityCommitment
        })

        if (alreadyExist === null) {
            showUnexpectedError()
            return
        }

        if (alreadyExist) {
            setWarningMessage(`You already joined this group with another ${capitalize(web2Provider)} account`)
            setError(true)
        }

        setIdentityCommitment(identityCommitment)
        setLoading(false)
    }

    async function joinGroup(groupId: string): Promise<void> {
        setLoading(true)

        const rootHash = await addIdentityCommitment({
            groupId,
            identityCommitment: _identityCommitment as string,
            web2AccountId
        })

        if (!rootHash) {
            showUnexpectedError()
            return
        }

        setGroup(null)
        setLoading(false)
    }

    return (
        <>
            <TabPanelContent
                title="Semaphore Group"
                description={
                    _error
                        ? ""
                        : _loading
                        ? "Loading..."
                        : _group
                        ? `The ${reputation} ${capitalize(web2Provider)} group has ${
                              _group?.size
                          } members. Create your Semaphore identity if you want to join this group.`
                        : `You joined the ${capitalize(web2Provider)} ${reputation} group.`
                }
                onLeftArrowClick={onArrowClick}
                onRightArrowClick={onArrowClick}
                warningMessage={_warningMessage}
                loading={_loading}
                buttonText={!_identityCommitment ? "Create identity" : "Join group"}
                onButtonClick={() =>
                    !_group
                        ? null
                        : !_identityCommitment
                        ? retrieveAndCheckIdentityCommitment(_group.id)
                        : joinGroup(_group.id)
                }
                buttonDisabled={_loading || !_group || _error}
                reputation={reputation}
                contractName={DeployedContracts.INTERREP_GROUPS}
            />
        </>
    )
}
