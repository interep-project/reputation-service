import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model"
import { ITwitterAccount, ITwitterAccountDocument } from "src/models/web2Accounts/twitter/TwitterAccount.types"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"

export const createTwitterAccountObject = (props: Omit<ITwitterAccount, "provider" | "createdAt" | "uniqueKey">) => ({
    provider: Web2Providers.TWITTER,
    uniqueKey: `${Web2Providers.TWITTER}:${props.providerAccountId}`,
    createdAt: Date.now(),
    ...props
})

export const instantiateNewTwitterAccount = (
    props: Omit<ITwitterAccount, "provider" | "createdAt" | "uniqueKey">
): ITwitterAccountDocument => new TwitterAccount(createTwitterAccountObject(props))
