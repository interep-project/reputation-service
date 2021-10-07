import { ReputationLevel } from "@interrep/reputation-criteria"
import { Provider } from "src/types/groups"
import { PoapGroupName } from "./poap"

export default function getGroupId(provider: Provider, reputationOrName: ReputationLevel | PoapGroupName): string {
    return `${provider.toUpperCase()}_${reputationOrName.toUpperCase()}`
}
