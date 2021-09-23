import { Contract, Event } from "ethers"

export default function getContractEvents(
    contractInstance: Contract,
    eventName: string,
    eventParameters: any[] = []
): Promise<Event[]> {
    const filter = contractInstance.filters[eventName](...eventParameters)

    return contractInstance.queryFilter(filter)
}
