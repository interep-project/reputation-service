import { TwitterParameters, Web2Provider } from "@interrep/reputation-criteria"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import createWeb2Account from "./createWeb2Account"

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

describe("Core web2 account functions", () => {
    const user: TwitterParameters | any = {
        verifiedProfile: true,
        followers: 100,
        botometerOverallScore: 2
    }

    describe("Create web2 account", () => {
        beforeAll(async () => {
            await connect()
        })

        afterAll(async () => {
            await dropDatabaseAndDisconnect()
        })

        afterEach(async () => {
            await clearDatabase()
        })

        it("Should throw if the reponse has no user id", async () => {
            await expect(() =>
                createWeb2Account(user, createNexAuthAccount({ id: "" }), Web2Provider.TWITTER)
            ).rejects.toThrow("Invalid account response")
        })

        it("Should save the tokens on an existing user", async () => {
            await createWeb2Account(
                user,
                createNexAuthAccount({ accessToken: "a", refreshToken: "b" }),
                Web2Provider.TWITTER
            )

            await createWeb2Account(user, createNexAuthAccount(), Web2Provider.TWITTER)
            const twitterAccount = await Web2Account.findByProviderAccountId(Web2Provider.TWITTER, providerAccountId)

            expect(twitterAccount!.accessToken).toBe(accessToken)
            expect(twitterAccount!.refreshToken).toBe(refreshToken)
        })

        it("Should create the account if it does not already exist in the db", async () => {
            await createWeb2Account(user, createNexAuthAccount(), Web2Provider.TWITTER)

            const twitterAccount = await Web2Account.findByProviderAccountId(Web2Provider.TWITTER, providerAccountId)

            expect(twitterAccount?.toObject()).toEqual(
                expect.objectContaining({
                    providerAccountId,
                    isLinkedToAddress: false,
                    isSeedUser: false,
                    accessToken,
                    refreshToken,
                    uniqueKey: `${Web2Provider.TWITTER}:${providerAccountId}`
                })
            )
        })
    })
})
