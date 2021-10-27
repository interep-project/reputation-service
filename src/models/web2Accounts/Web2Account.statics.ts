import { OAuthProvider } from "@interrep/reputation-criteria"
import Web2Account from "./Web2Account.model"
import { IWeb2AccountDocument } from "./Web2Account.types"

export async function findByProviderAccountId(
    this: typeof Web2Account,
    provider: OAuthProvider,
    providerAccountId: string
): Promise<IWeb2AccountDocument | null> {
    return this.findOne({
        provider,
        providerAccountId
    })
}
