import { TwitterAccount } from "next-auth"
import { ITwitterAccountDocument } from "src/models/web2Accounts/twitter/TwitterAccount.types"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"
import { instantiateNewTwitterAccount } from "src/utils/server/createNewTwitterAccount"
import { dbConnect } from "src/utils/server/database"

const handleSignIn = async (account: TwitterAccount) => {
    await dbConnect()

    if (!account.id || !account.results.user_id) {
        throw new Error("Invalid account response")
    }

    let twitterAccount: ITwitterAccountDocument | null = null

    try {
        twitterAccount = (await Web2Account.findByProviderAccountId(
            Web2Providers.TWITTER,
            account.results.user_id
        )) as ITwitterAccountDocument
    } catch (error) {
        throw new Error(`Error trying to retrieve the account: ${error}`)
    }

    if (!twitterAccount) {
        // Populate with more data?
        twitterAccount = instantiateNewTwitterAccount({
            providerAccountId: account.results.user_id,
            isLinkedToAddress: false,
            user: {
                id: account.results.user_id,
                username: account.results.screen_name
            },
            accessToken: account.accessToken,
            refreshToken: account.refreshToken
        })
    } else {
        twitterAccount.accessToken = account.accessToken
        twitterAccount.refreshToken = account.refreshToken
    }

    try {
        await twitterAccount.save()
    } catch (error) {
        throw new Error(`Error trying to save the account: ${error}`)
    }

    return true
}

export default handleSignIn
