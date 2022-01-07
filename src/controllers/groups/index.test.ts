import { OAuthAccount } from "@interrep/db"
import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { getSession } from "next-auth/client"
import { appendLeaf } from "src/core/groups/mts"
import { createSessionMock } from "src/mocks"
import createNextMocks from "src/mocks/createNextMocks"
import createOAuthAccountMock from "src/mocks/createOAuthAccountMock"
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
import hasJoinedAGroupController from "./hasJoinedAGroup"
import handleIdentityCommitmentController from "./handleIdentityCommitment"

jest.mock("next-auth/client", () => ({
    getSession: jest.fn()
}))

jest.mock("src/utils/backend/database/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
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
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await OAuthAccount.create(createOAuthAccountMock({ provider: OAuthProvider.GITHUB }))
            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the account has the wrong reputation", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await OAuthAccount.create(createOAuthAccountMock({ reputation: ReputationLevel.BRONZE }))
            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should return error 500 if the identity commitment already exist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await OAuthAccount.create(createOAuthAccountMock({ hasJoinedAGroup: true }))
            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should add the identity commitment", async () => {
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
            const { req, res } = createNextMocks({
                method: "DELETE",
                query: { provider, name, identityCommitment: "111" },
                body: { accountId: "6087dabb0b3af8703a581bef" }
            })

            await OAuthAccount.create(createOAuthAccountMock())
            ;(getSession as any).mockImplementationOnce(() => createSessionMock())

            await handleIdentityCommitmentController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should delete the identity commitment", async () => {
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
    })
})
