import { EmailUser, OAuthAccount, TelegramUser } from "@interep/db"
import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { TelegramGroup } from "@interep/telegram-bot"
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
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { seedZeroHashes } from "src/utils/backend/seeding"
import getGroupController from "./getGroup"
import getGroupMembersController from "./getGroupMembers"
import getGroupsController from "./getGroups"
import getMerkleProofController from "./getMerkleProof"
import handleMemberController from "./handleMember"
import hasJoinedAGroupController from "./hasJoinedAGroup"

jest.mock("next-auth/client", () => ({
    getSession: jest.fn()
}))

jest.mock("src/utils/backend/database", () => ({
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
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
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

            ;(_connectDatabase as any).mockImplementationOnce(() => {
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

    describe("# getGroupMembers", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name }
            })

            await getGroupMembersController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: 1 }
            })

            await getGroupMembersController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a" }
            })

            await getGroupMembersController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getGroupMembersController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return the group members", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await getGroupMembersController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toHaveLength(0)
        })

        it("Should return the group members with limit and offset", async () => {
            await seedZeroHashes()
            await appendLeaf(provider, name, "111")
            await appendLeaf(provider, name, "222")
            await appendLeaf(provider, name, "333")

            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, limit: "1", offset: "1" }
            })

            await getGroupMembersController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toHaveLength(1)
            expect(data).toContain("222")
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

            ;(_connectDatabase as any).mockImplementationOnce(() => {
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
                query: { provider, name: "pinco", member: "1" }
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 404 if a member does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member: "1" }
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await getMerkleProofController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return a Merkle proof", async () => {
            await seedZeroHashes()

            const member = "1"

            await appendLeaf(provider, name, member)

            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member }
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
            ;(_connectDatabase as any).mockImplementationOnce(() => {
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

    describe("# handleMember", () => {
        it("Should return error 405 if the http method is neither a GET, nor a POST, nor a DELETE", async () => {
            const { req, res } = createNextMocks({
                method: "PUT"
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a", member: "111" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member: "111" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return false if a member does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member: "111" }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "222")

            await handleMemberController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeFalsy()
        })

        it("Should return true if a leaf exists", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, member: "111" }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "111")

            await handleMemberController(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data).toBeTruthy()
        })

        it("Should return error 401 if the origin domain is not whitelisted", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                headers: {
                    origin: "https://example.com"
                }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })
    })

    describe("# handleOAuthMember", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 401 if there is no authorized session", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it("Should return error 403 if session account does not match the body account", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: "6087dabb0b3af8703a581bed" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(403)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())
            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if there the account does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the account has the wrong provider", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ provider: OAuthProvider.GITHUB }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the account has the wrong reputation", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ reputation: ReputationLevel.BRONZE }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            await OAuthAccount.create(createOAuthAccountMock({ reputation: ReputationLevel.BRONZE }))
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if a member already exists", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a member", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock())
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            await seedZeroHashes()
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if a member does not exist", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock())
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete a member", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, member: "111" },
                body: { accountId: account.id }
            })

            await seedZeroHashes()
            await appendLeaf(provider, name, "111")
            ;(getSession as any).mockImplementationOnce(() => createSessionMock({ accountId: account.id }))

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if a member already exists (OAuth token)", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a Twitter member (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if a member does not exist yet (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete a Twitter member (OAuth token)", async () => {
            const account = await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should add a Github member (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: OAuthProvider.GITHUB, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should add a Reddit member (OAuth token)", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: OAuthProvider.REDDIT, name, member: "111" },
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

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handleEmailMember", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", member: "111" },
                body: { emailUserId: "id" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the email account does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 401 if the user does not have the right token", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", member: "111" },
                body: { emailUserId: "id", emailUserToken: "token1" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: "hotmail", member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if a member already exists", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: EmailDomain.HOTMAIL, member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: true,
                verificationToken: "token"
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a member", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "email", name: EmailDomain.HOTMAIL, member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })
            await seedZeroHashes()

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if the email user does not have joined the group", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "email", name: EmailDomain.HOTMAIL, member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: false,
                verificationToken: "token"
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete a member", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "email", name: EmailDomain.HOTMAIL, member: "111" },
                body: { emailUserId: "id", emailUserToken: "token" }
            })

            await EmailUser.create({
                hashId: "035780b2481863f9cb735ec10e57c812936fdc18bfb8a059310841663bf58a10",
                hasJoined: true,
                verificationToken: "token"
            })
            await seedZeroHashes()
            await appendLeaf("email", EmailDomain.HOTMAIL, "111")

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handlePoapMember", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: { userSignature: "signature" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 403 if the signature is not valid", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961d",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(403)
        })

        it("Should return error 500 if the POAP user does not have any supported event token", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => [])

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })
            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a member", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await seedZeroHashes()

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should delete a member", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "poap", name: PoapEvent.DEVCON_3, member: "111" },
                body: {
                    userSignature:
                        "0xf575804b73ae8d8dc5a1e0ee07d810db1fe0971029d1b652a835c9007a444ec82c3c773f6aa84330954a444da0a9365bc19e280ecbd0eb5feac90bd9015432961c",
                    userAddress: "0xb94c5535d1230AB683570De9afbe53F2C40830E8"
                }
            })

            ;(getPoapEventsByAddress as any).mockImplementationOnce(() => ["devcon3"])

            await seedZeroHashes()
            await appendLeaf("poap", PoapEvent.DEVCON_3, "111")

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })

    describe("# handleTelegramMember", () => {
        it("Should return error 400 if the body parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the telegram user does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if a member already exists", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: true
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add a member", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: false
            })
            await seedZeroHashes()

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })

        it("Should return error 500 if a member does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: false
            })

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete a member", async () => {
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider: "telegram", name: TelegramGroup.INTERREP, member: "111" },
                body: { telegramUserId: "id" }
            })

            await TelegramUser.create({
                hashId: "f9dfbff8d282f6e65b09042010e1b80053e4121b17cd3e6eda0bb2b989ccdc19",
                hasJoined: true
            })

            await seedZeroHashes()
            await appendLeaf("telegram", TelegramGroup.INTERREP, "111")

            await handleMemberController(req, res)

            expect(res._getStatusCode()).toBe(201)
        })
    })
})
