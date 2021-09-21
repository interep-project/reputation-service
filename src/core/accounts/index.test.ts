import { Web2Provider } from "@interrep/reputation-criteria"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"
import { checkWeb2Provider } from "."
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

jest.mock("src/core/reputation/twitter", () => ({
    getTwitterParametersById: jest.fn(() => ({
        followers: 100,
        verifiedProfile: true,
        botometerOverallScore: 2
    }))
}))

describe("Core web2 account functions", () => {
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
                createWeb2Account(createNexAuthAccount({ id: "" }), Web2Provider.TWITTER)
            ).rejects.toThrow("Invalid account response")
        })

        it("Should save the tokens on an existing user", async () => {
            await createWeb2Account(createNexAuthAccount({ accessToken: "a", refreshToken: "b" }), Web2Provider.TWITTER)

            await createWeb2Account(createNexAuthAccount(), Web2Provider.TWITTER)
            const twitterAccount = await Web2Account.findByProviderAccountId(Web2Provider.TWITTER, providerAccountId)

            expect(twitterAccount!.accessToken).toBe(accessToken)
            expect(twitterAccount!.refreshToken).toBe(refreshToken)
        })

        it("Should create the account if it does not already exist in the db", async () => {
            await createWeb2Account(createNexAuthAccount(), Web2Provider.TWITTER)

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

    describe("Check web2 provider", () => {
        it("Should return true if a web2 provider exists", () => {
            const isAnExistingWeb2Provider = checkWeb2Provider(Web2Provider.TWITTER)

            expect(isAnExistingWeb2Provider).toBeTruthy()
        })

        it("Should return false if a web2 provider does not exist", () => {
            // @ts-ignore
            const isAnExistingWeb2Provider = checkWeb2Provider("facebook")

            expect(isAnExistingWeb2Provider).toBeFalsy()
        })
    })
})
