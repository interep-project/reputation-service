import { ReputationLevel } from "@interrep/reputation-criteria"
import { mockBotometerData } from "src/mocks/botometerData"
import { ITwitterAccountDocument } from "src/models/web2Accounts/twitter/TwitterAccount.types"
import Web2Account from "src/models/web2Accounts/Web2Account.model"
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types"
import getBotScore from "src/services/botometer"
import { getTwitterUserById } from "src/services/twitter"
import { TwitterUser } from "src/types/twitter"
import { instantiateNewTwitterAccount } from "src/utils/server/createNewTwitterAccount"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"
import { checkTwitterReputationById, getTwitterUserReputation } from "."

jest.mock("src/services/twitter", () => ({
    getTwitterUserById: jest.fn()
}))

jest.mock("src/services/botometer", () => ({
    __esModule: true,
    default: jest.fn()
}))

const getTwitterUserByIdMocked = getTwitterUserById as jest.MockedFunction<typeof getTwitterUserById>
const getBotscoreMocked = getBotScore as jest.MockedFunction<typeof getBotScore>

describe("checkTwitterReputation", () => {
    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        jest.clearAllMocks()
        await clearDatabase()
    })

    it("should return user directly if reputation is already in DB", async () => {
        // Given
        const mockUser = {
            provider: Web2Providers.TWITTER,
            providerAccountId: "1",
            user: { username: "vitalik", id: "1" },
            basicReputation: ReputationLevel.GOLD,
            isLinkedToAddress: false
        }
        const mockTwitterUserId = mockUser.user.id
        await instantiateNewTwitterAccount(mockUser).save()

        // When
        const result = await checkTwitterReputationById(mockTwitterUserId)

        // Expect
        expect(result?.user?.id).toEqual(mockTwitterUserId)
        expect(getTwitterUserById).not.toHaveBeenCalled()
    })

    it("should call to fetch twitter data", async () => {
        await checkTwitterReputationById("123")

        expect(getTwitterUserById).toHaveBeenCalledWith({
            id: "123"
        })
    })

    it("should return null if no twitter data is returned", async () => {
        const result = await checkTwitterReputationById("zzasdadsadsad")

        expect(result).toBeNull()
    })

    describe("Basic checks with Twitter data", () => {
        let twitterUser: TwitterUser

        beforeEach(() => {
            // Given
            twitterUser = {
                username: "Username",
                created_at: "created_at",
                id: "userId",
                name: "name",
                profile_image_url: "img_url",
                public_metrics: {
                    tweet_count: 0,
                    followers_count: 0,
                    following_count: 0,
                    listed_count: 0
                },
                verified: false
            }

            getTwitterUserByIdMocked.mockImplementation(() => Promise.resolve(twitterUser))
            getBotscoreMocked.mockImplementation(() => Promise.resolve(mockBotometerData))
        })

        it("should perform basic checks and return user", async () => {
            // When
            const result = await checkTwitterReputationById("userId")

            // Expect
            expect(result?.user).toMatchObject({
                ...twitterUser,
                // username is stored in lowercase in DB
                username: twitterUser.username.toLowerCase()
            })
            expect(
                // @ts-ignore: basicReputation is defined
                Object.values(ReputationLevel).includes(result?.basicReputation)
            ).toBeTruthy()
        })

        it("should save user in DB after basic twitter reputation check", async () => {
            // When
            await checkTwitterReputationById(twitterUser.id)

            const account = await Web2Account.findByProviderAccountId(Web2Providers.TWITTER, twitterUser.id)

            if (!account) throw new Error()

            // Expect
            expect((account as ITwitterAccountDocument).user).toMatchObject({
                ...twitterUser,
                // username is stored in lowercase in DB
                username: twitterUser.username.toLowerCase()
            })
            expect(
                // @ts-expect-error: should be defined
                Object.values(ReputationLevel).includes(account?.basicReputation)
            ).toBeTruthy()
        })
    })

    describe("getTwitterUserReputation", () => {
        let twitterUser: TwitterUser
        const twitterAccount = null

        beforeEach(() => {
            // Given
            twitterUser = {
                username: "amiabot",
                created_at: "created_at",
                id: "id",
                name: "Am I a bot?",
                profile_image_url: "img_url",
                public_metrics: {
                    tweet_count: 3000,
                    followers_count: 400,
                    following_count: 2349,
                    listed_count: 34
                },
                verified: false
            }
            getTwitterUserByIdMocked.mockImplementation(() => Promise.resolve(twitterUser))
            getBotscoreMocked.mockImplementation(() => Promise.resolve(mockBotometerData))
        })

        it("Should return botometer data when reputation is not obvious", async () => {
            // When
            const response = await getTwitterUserReputation({
                twitterAccount,
                twitterUser
            })

            // Expect
            expect(response?.basicReputation).toBe(ReputationLevel.NOT_SUFFICIENT)
            expect(response?.botometer).toEqual({
                raw_scores: mockBotometerData.raw_scores,
                display_scores: mockBotometerData.display_scores,
                cap: mockBotometerData.cap
            })
        })

        it("Should save botometer data when reputation is not obvious", async () => {
            // When
            await getTwitterUserReputation({
                twitterAccount,
                twitterUser
            })
            const account = await Web2Account.findByProviderAccountId(Web2Providers.TWITTER, twitterUser.id)
            const userObject = (account as ITwitterAccountDocument)?.toObject()

            // Expect
            expect(account?.basicReputation).toBe(ReputationLevel.NOT_SUFFICIENT)
            expect(userObject?.botometer).toEqual({
                raw_scores: mockBotometerData.raw_scores,
                display_scores: mockBotometerData.display_scores,
                cap: mockBotometerData.cap
            })
        })

        it("should set reputation as GOLD if bot score =< 1", async () => {
            // Given
            const mockBotometerDataNotABot = {
                ...mockBotometerData,
                display_scores: {
                    ...mockBotometerData.display_scores,
                    universal: { overall: 0.8 }
                }
            }
            getBotscoreMocked.mockImplementationOnce(() => Promise.resolve(mockBotometerDataNotABot))

            // When
            await getTwitterUserReputation({
                twitterAccount,
                twitterUser
            })
            const account = await Web2Account.findByProviderAccountId(Web2Providers.TWITTER, twitterUser.id)
            const userObject = (account as ITwitterAccountDocument)?.toObject()

            // Expect
            expect(account?.basicReputation).toBe(ReputationLevel.GOLD)
            expect(userObject?.botometer).toEqual({
                raw_scores: mockBotometerDataNotABot.raw_scores,
                display_scores: mockBotometerDataNotABot.display_scores,
                cap: mockBotometerDataNotABot.cap
            })
        })

        it("should return null if botometer failed", async () => {
            getBotscoreMocked.mockImplementation(() => Promise.resolve(undefined))
            const result = await getTwitterUserReputation({
                twitterAccount,
                twitterUser
            })

            expect(result).toBeNull()
        })
    })
})
