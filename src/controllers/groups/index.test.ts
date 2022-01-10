import { EmailUser, OAuthAccount, TelegramUser } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { TelegramGroup } from "@interrep/telegram-bot"
import { getSession } from "next-auth/client"
import { EmailDomain } from "src/core/email"
import { appendLeaf } from "src/core/groups/mts"
import { PoapEvent } from "src/core/poap"
import getPoapEventsByAddress from "src/core/poap/getPoapEventsByAddress"
import { createSessionMock } from "src/mocks"
import createNextMocks from "src/mocks/createNextMocks"
import createOAuthAccountMock from "src/mocks/createOAuthAccountMock"
import { getBotometerScore } from "src/services/botometer"
import { getGithubUserByToken } from "src/services/github"
import { getRedditUserByToken } from "src/services/reddit"
import { getTwitterUserByToken } from "src/services/twitter"
import {
    clearTestingDatabase,
    connectDatabase,
    connectTestingDatabase,
    disconnectTestingDatabase
} from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getGroupController from "./getGroup"
import getGroupsController from "./getGroups"
import getMerkleProofController from "./getMerkleProof"
import handleIdentityCommitmentController from "./handleIdentityCommitment"
import hasJoinedAGroupController from "./hasJoinedAGroup"

jest.mock("next-auth/client", () => ({
    getSession: jest.fn()
}))

jest.mock("src/utils/backend/database/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

jest.mock("src/services/twitter", () => ({
    __esModule: true,
    getTwitterUserByToken: jest.fn()
}))

jest.mock("src/services/botometer", () => ({
    __esModule: true,
    getBotometerScore: jest.fn()
}))

jest.mock("src/services/github", () => ({
    __esModule: true,
    getGithubUserByToken: jest.fn()
}))

jest.mock("src/services/reddit", () => ({
    __esModule: true,
    getRedditUserByToken: jest.fn()
}))

jest.mock("src/core/poap/getPoapEventsByAddress", () => ({
    __esModule: true,
    default: jest.fn()
}))

describe("# controllers/groups", () => {
    const provider = OAuthProvider.TWITTER
    const name = ReputationLevel.GOLD

    beforeAll(async () => {
        await connectTestingDatabase()
    })

    afterAll(async () => {
        await disconnectTestingDatabase()
    })

    afterEach(async () => {
        await clearTestingDatabase()
    })

    describe("# getGroup", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name }
            })

            await getGroupController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: 1 }
            })

            await getGroupController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a" }
            })

            await getGroupController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getGroupController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a group", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await getGroupController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.provider).toBe(provider)
            expect(data.name).toBe(name)
            expect(data.size).toBe(0)
        })
    })

    describe("# getGroups", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getGroupsController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getGroupsController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a list of groups", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await getGroupsController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.length).toBeGreaterThan(0)
        })
    })

    describe("# getMerkleProof", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "pinco", identityCommitment: "1" }
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 404 if the identity commitment does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "1" }
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "111" }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a Merkle proof", async () => {
            await seedZeroHashes()

            const identityCommitment = "1"

            await appendLeaf(provider, name, identityCommitment)

            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment }
            })

            await getMerkleProofController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.root).not.toBeUndefined()
        })
    })

    describe("# hasJoinedAGroup", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await hasJoinedAGroupController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 401 if there is no authorized session", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await hasJoinedAGroupController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it("Should return error 500 if the authenticated account does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await hasJoinedAGroupController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())
            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await hasJoinedAGroupController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return true if the authenticated account has joined a group", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await hasJoinedAGroupController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })
    })

    describe("# handleIdentityCommitment", () => {
        it("Should return error 405 if the http method is neither a GET, nor a POST, nor a DELETE", async () => {
            const { req, res } = createNextMocks({
                method: "PUT"
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a", identityCommitment: "111" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "111" }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if a identity commitment does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "111" }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "222")

            await handleIdentityCommitmentController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a leaf exists", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "111" }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "111")

            await handleIdentityCommitmentController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })

        it("Should return error 401 if the origin domain is not whitelisted", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                headers: {
                    origin: "https://example.com"
                }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })
    })

    describe("# handleOAuthIdentityCommitment", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 401 if there is no authorized session", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it("Should return error 403 if session account does not match the body account", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bed" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(403)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())
            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if there the account does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the account has the wrong provider", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ provider: OAuthProvider.GITHUB }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the account has the wrong reputation", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ reputation: ReputationLevel.BRONZE }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            await OAuthAccount.create(createOAuthAccountMock({ reputation: ReputationLevel.BRONZE }))
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the identity commitment already exists", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add an identity commitment", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock())
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            await seedZeroHashes()
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the identity commitment does not exist", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock())
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete an identity commitment", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: account.id }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "111")
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the identity commitment already exists (OAuth token)", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getTwitterUserByToken as any).mockImplementationOnce(() => ({
                id_str: account.providerAccountId,
                screen_name: "jack",
                followers_count: 100,
                verified: true
            }))
            ;(getBotometerScore as any).mockImplementationOnce(() => ({
                display_scores: { universal: { overall: 2 } }
            }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a Twitter identity commitment (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getTwitterUserByToken as any).mockImplementationOnce(() => ({
                id_str: "id",
                screen_name: "jack",
                followers_count: 100,
                verified: true
            }))
            ;(getBotometerScore as any).mockImplementationOnce(() => ({
                display_scores: { universal: { overall: 2 } }
            }))

            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the identity commitment does not exist yet (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getTwitterUserByToken as any).mockImplementationOnce(() => ({
                id_str: "id",
                screen_name: "jack",
                followers_count: 100,
                verified: true
            }))
            ;(getBotometerScore as any).mockImplementationOnce(() => ({
                display_scores: { universal: { overall: 2 } }
            }))

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete a Twitter identity commitment (OAuth token)", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getTwitterUserByToken as any).mockImplementationOnce(() => ({
                id_str: account.providerAccountId,
                screen_name: "jack",
                followers_count: 100,
                verified: true
            }))
            ;(getBotometerScore as any).mockImplementationOnce(() => ({
                display_scores: { universal: { overall: 2 } }
            }))

            await seedZeroHashes()
            await appendLeaf(provider, name, "111")

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should add a Github identity commitment (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: OAuthProvider.GITHUB, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getGithubUserByToken as any).mockImplementationOnce(() => ({
                id: "id",
                plan: true,
                followers: 1000,
                receivedStars: 100
            }))

            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should add a Reddit identity commitment (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: OAuthProvider.REDDIT, name, identityCommitment: "111" },
                headers: {
                    authorization: "token"
                }
            })

            ;(getRedditUserByToken as any).mockImplementationOnce(() => ({
                id: "id",
                has_subscribed_to_premium: true,
                total_karma: 1000,
                coins: 100,
                linked_identities: ["twitter", "facebook"]
            }))

            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handleEmailIdentityCommitment", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", identityCommitment: "111" },
                body: { emailUserId: "id" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the email account does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 401 if the user does not have the right token", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token1" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the identity commitment already exists", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: EmailDomain.HOTMAIL, identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: true,
                verificationToken: "token"
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: EmailDomain.HOTMAIL, identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })
            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the email user does not have joined the group", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "email", name: EmailDomain.HOTMAIL, identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "email", name: EmailDomain.HOTMAIL, identityCommitment: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: true,
                verificationToken: "token"
            })
            await seedZeroHashes()
            await appendLeaf("email", EmailDomain.HOTMAIL, "111")

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handlePoapIdentityCommitment", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: { userSignature: "signature" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 403 if the signature is not valid", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961d",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(403)
        })

        it("Should return error 500 if the POAP user does not have any supported event token", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => [])

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })
            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should delete an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, identityCommitment: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await seedZeroHashes()
            await appendLeaf("poap", PoapEvent.DEVCON_3, "111")

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handleTelegramIdentityCommitment", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the telegram user does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            ;(connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the identity commitment already exists", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: true
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: false
            })
            await seedZeroHashes()

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the identity commitment does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: false
            })

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete an identity commitment", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, identityCommitment: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: true
            })

            await seedZeroHashes()
            await appendLeaf("telegram", TelegramGroup.INTERREP, "111")

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })
})
