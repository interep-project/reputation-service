import { OAuthAccount, OAuthAccountDocument } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { clearTestingDatabase, connectTestingDatabase, disconnectTestingDatabase } from "src/utils/backend/database"
import createOAuthAccount from "./createOAuthAccount"

describe("# core/oauth", () => {
    beforeAll(async () => {
        await connectTestingDatabase()
    })

    afterAll(async () => {
        await disconnectTestingDatabase()
    })

    describe("# createOAuthAccount", () => {
        function createNextAuthAccount(override?: any) {
            return {
                id: "123",
                provider: OAuthProvider.TWITTER,
                accessToken: "a",
                refreshToken: "b",
                ...override
            }
        }
        const twitterUser: any = {
            verifiedProfile: true,
            followers: 100,
            botometerOverallScore: 2
        }

        afterEach(async () => {
            await clearTestingDatabase()
        })

        it("Should create a Twitter account if it does not already exist in the db", async () => {
            const nextAuthAccount = createNextAuthAccount()

            await createOAuthAccount(twitterUser, nextAuthAccount)

            const expectedValue = await OAuthAccount.findByProviderAccountId(
                nextAuthAccount.provider,
                nextAuthAccount.id
            )

            expect(expectedValue).toEqual(
                expect.objectContaining({
                    reputation: ReputationLevel.GOLD,
                    provider: nextAuthAccount.provider,
                    providerAccountId: nextAuthAccount.id,
                    isLinkedToAddress: false,
                    hasJoinedAGroup: false,
                    accessToken: nextAuthAccount.accessToken,
                    refreshToken: nextAuthAccount.refreshToken
                })
            )
        })

        it("Should create a Github account if it does not already exist in the db", async () => {
            const nextAuthAccount = createNextAuthAccount({ provider: OAuthProvider.GITHUB })

            await createOAuthAccount(
                {
                    proPlan: true,
                    followers: 1000,
                    receivedStars: 100
                } as any,
                nextAuthAccount
            )

            const expectedValue = (await OAuthAccount.findByProviderAccountId(
                nextAuthAccount.provider,
                nextAuthAccount.id
            )) as OAuthAccountDocument

            expect(expectedValue.provider).toBe(OAuthProvider.GITHUB)
            expect(expectedValue.reputation).toBe(ReputationLevel.GOLD)
        })

        it("Should create a Reddit account if it does not already exist in the db", async () => {
            const nextAuthAccount = createNextAuthAccount({ provider: OAuthProvider.REDDIT })

            await createOAuthAccount(
                {
                    premiumSubscription: true,
                    karma: 1000,
                    coins: 100,
                    linkedIdentities: 3
                } as any,
                nextAuthAccount
            )

            const expectedValue = (await OAuthAccount.findByProviderAccountId(
                nextAuthAccount.provider,
                nextAuthAccount.id
            )) as OAuthAccountDocument

            expect(expectedValue.provider).toBe(OAuthProvider.REDDIT)
            expect(expectedValue.reputation).toBe(ReputationLevel.GOLD)
        })

        it("Should update the OAuth tokens if there is already an account in the db", async () => {
            const nextAuthAccount = createNextAuthAccount()

            await createOAuthAccount(twitterUser, nextAuthAccount)

            await createOAuthAccount(
                twitterUser,
                createNextAuthAccount({
                    accessToken: "c",
                    refreshToken: "d"
                })
            )

            const expectedValue = await OAuthAccount.findByProviderAccountId(
                nextAuthAccount.provider,
                nextAuthAccount.id
            )

            expect(expectedValue).toEqual(
                expect.objectContaining({
                    accessToken: "c",
                    refreshToken: "d"
                })
            )
        })
    })
})
