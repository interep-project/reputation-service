import { Web2Provider } from "@interrep/reputation-criteria"
import { contractAddresses, ContractName, currentNetwork } from "src/config"

export default function getContractAddress(contractName: ContractName, web2Provider?: Web2Provider): string {
    if (contractName === ContractName.INTERREP_GROUPS) {
        return contractAddresses[currentNetwork.id][ContractName.INTERREP_GROUPS]
    }

    if (!web2Provider) {
        throw new Error(`You must specify a Web2 provider to obtain a ${contractName} address`)
    }

    return contractAddresses[currentNetwork.id][ContractName.REPUTATION_BADGE][web2Provider]
}
