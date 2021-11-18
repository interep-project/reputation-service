import { getOAuthProviders } from "@interrep/reputation-criteria"
import { Provider, Web3Provider } from "src/types/groups"

export default function getProviders(): Provider[] {
    return [...getOAuthProviders(), Web3Provider.POAP, "telegram", "email"]
}
