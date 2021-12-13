import { getOAuthProviders } from "@interrep/reputation"
import { Provider, Web3Provider } from "src/types/groups"

export default function getProviders(): Provider[] {
    return [...getOAuthProviders(), Web3Provider.POAP, "telegram", "email"]
}
