import { getOAuthProviders } from "@interrep/reputation"
import { Provider } from "src/types/groups"

export default function getProviders(): Provider[] {
    return [...getOAuthProviders(), "poap", "telegram", "email"]
}
