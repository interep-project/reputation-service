import { TwitterParameters, OAuthProvider } from "@interrep/reputation-criteria"
import { OAuthAccount } from "@interrep/db"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import createOAuthAccount from "./createOAuthAccount"

const providerAccountId = "user_id"
const accessToken = "accessToken"
const refreshToken = "refreshToken"

function createNexAuthAccount(override?: any) {
    return {
        id: providerAccountId,
        provider: "twitter",
        type: "Oauth",
        accessToken,
        refreshToken,
        ...override
    }
}

describe("Core OAuth account functions", () => {
    const user: TwitterParameters | any = {
        verifiedProfile: true,
        followers: 100,
        botometerOverallScore: 2
    }

    describe("Create OAuth account", () => {
        beforeAll(async () => {
            await connectDatabase()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        afterEach(async () => {
            await clearDatabase()
        })

        it("Should throw if the reponse has no user id", async () => {
            await expect(() =>
                createOAuthAccount(user, createNexAuthAccount({ id: "" }), OAuthProvider.TWITTER)
            ).rejects.toThrow("Invalid account response")
        })

        it("Should save the tokens on an existing user", async () => {
            await createOAuthAccount(
                user,
                createNexAuthAccount({ accessToken: "a", refreshToken: "b" }),
                OAuthProvider.TWITTER
            )

            await createOAuthAccount(user, createNexAuthAccount(), OAuthProvider.TWITTER)
            const twitterAccount = await OAuthAccount.findByProviderAccountId(OAuthProvider.TWITTER, providerAccountId)

            expect(twitterAccount!.accessToken).toBe(accessToken)
            expect(twitterAccount!.refreshToken).toBe(refreshToken)
        })

        it("Should create the account if it does not already exist in the db", async () => {
            await createOAuthAccount(user, createNexAuthAccount(), OAuthProvider.TWITTER)

            const twitterAccount = await OAuthAccount.findByProviderAccountId(OAuthProvider.TWITTER, providerAccountId)

            expect(twitterAccount?.toObject()).toEqual(
                expect.objectContaining({
                    providerAccountId,
                    isLinkedToAddress: false,
                    isSeedUser: false,
                    accessToken,
                    refreshToken,
                    uniqueKey: `${OAuthProvider.TWITTER}:${providerAccountId}`
                })
            )
        })
    })
})
