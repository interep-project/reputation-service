import { ContractName } from "src/config"
import { getBackendContractInstance } from "src/utils/backend"
import { getContractAddress, getContractEvents } from "src/utils/common"

export default async function retrieveEvents(eventName: string): Promise<any[]> {
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)
    const events = await getContractEvents(contractInstance, eventName)

    return events.map((event) => event.args)
}
