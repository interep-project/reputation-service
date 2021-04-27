import Web2Account from "./Web2Account.model";
import { IWeb2AccountDocument, Web2Providers } from "./Web2Account.types";

export async function findByProviderAccountId(
  this: typeof Web2Account,
  provider: Web2Providers,
  providerAccountId: string
): Promise<IWeb2AccountDocument | null> {
  return this.findOne({
    provider,
    providerAccountId,
  });
}
