import { TwitterParameters, OAuthProvider } from "@interrep/reputation"
import { OAuthAccount } from "@interrep/db"
import { clearTestingDatabase, connectTestingDatabase, disconnectTestingDatabase } from "src/utils/backend/database"
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

describe("# core/auth", () => {
    const user: TwitterParameters | any = {
        verifiedProfile: true,
        followers: 100,
        botometerOverallScore: 2
    }

    describe("# createOAuthAccount", () => {
        beforeAll(async () => {
            await connectTestingDatabase()
        })

        afterAll(async () => {
            await disconnectTestingDatabase()
        })

        afterEach(async () => {
            await clearTestingDatabase()
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
                    hasJoinedAGroup: false,
                    accessToken,
                    refreshToken
                })
            )
        })
    })
})
