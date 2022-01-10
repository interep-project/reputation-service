/* istanbul ignore file */
import { Contract, Event } from "ethers"

/**
 * Return the events of a contract.
 * @param contractInstance The contract instance.
 * @param eventName The name of the event.
 * @param eventParameters A list of possible parameters to be used.
 * @returns A list of events.
 */
export default function getContractEvents(
    contractInstance: Contract,
    eventName: string,
    eventParameters: any[] = []
): Promise<Event[]> {
    const filter = contractInstance.filters[eventName](...eventParameters)

    return contractInstance.queryFilter(filter)
}
