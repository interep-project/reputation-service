import { ContractName } from "src/config"
import getBackendContractInstance from "src/utils/backend/getBackendContractInstance"
import getContractAddress from "src/utils/common/getContractAddress"

export default async function retrieveEvents(eventName: string): Promise<any[]> {
    const contractAddress = getContractAddress(ContractName.GROUPS)
    const contractInstance = await getBackendContractInstance(ContractName.GROUPS, contractAddress)

    const filter = contractInstance.filters[eventName]()
    const events = await contractInstance.queryFilter(filter)

    return events.map((event) => event.args)
}
