import { getProviders } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"

export default function getAllProviders(): Provider[] {
    return [...getProviders(), Web3Provider.POAP, "telegram"]
}
