import { calculateReputation, Platform } from "@interrep/reputation-criteria"
import { Account } from "next-auth"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"
import { dbConnect } from "src/utils/server/database"
import { getTwitterParametersById } from "../reputation/twitter"

export default async function createWeb2Account(account: Account, provider: Web2Providers): Promise<void> {
    await dbConnect()

    if (!account.id) {
        throw new Error("Invalid account response")
    }

    try {
        let web2Account = await Web2Account.findByProviderAccountId(provider, account.id)

        if (!web2Account) {
            web2Account = new Web2Account({
                provider,
                providerAccountId: account.id,
                isLinkedToAddress: false,
                accessToken: account.accessToken,
                refreshToken: account.refreshToken,
                uniqueKey: `${provider}:${account.id}`,
                createdAt: Date.now()
            })

            switch (provider) {
                case Web2Providers.TWITTER: {
                    const parameters = await getTwitterParametersById(account.id)
                    web2Account.basicReputation = calculateReputation(Platform.TWITTER, parameters)

                    break
                }
                default:
            }
        } else {
            web2Account.accessToken = account.accessToken
            web2Account.refreshToken = account.refreshToken
        }

        try {
            await web2Account.save()
        } catch (error) {
            throw new Error(`Error trying to save the account: ${error}`)
        }
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }
}
