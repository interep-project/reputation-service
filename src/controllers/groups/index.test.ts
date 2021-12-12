import { OAuthProvider, ReputationLevel } from "@interrep/reputation-criteria"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import { Provider } from "src/types/groups"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import getGroup from "./getGroup"
import getGroups from "./getGroups"
import getMerkleTreeProof from "./getMerkleTreeProof"

describe("# controllers/groups", () => {
    const provider = OAuthProvider.TWITTER
    const name = ReputationLevel.GOLD

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
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

            await getGroup(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: 1 }
            })

            await getGroup(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a" }
            })

            await getGroup(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return a group", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name }
            })

            await getGroup(req, res)

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

            await getGroups(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return a list of groups", async () => {
            const { req, res } = createNextMocks({
                method: "GET"
            })

            await getGroups(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.length).toBeGreaterThan(0)
        })
    })

    describe("# getMerkleTreeProof", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getMerkleTreeProof(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: 1, identityCommitment: "1" }
            })

            await getMerkleTreeProof(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the group does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name: "a", identityCommitment: "1" }
            })

            await getMerkleTreeProof(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 404 if the identity commitment does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "1" }
            })

            await getMerkleTreeProof(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return a Merkle proof", async () => {
            await seedZeroHashes()
            await appendLeaf(provider as Provider, name, "1")

            const { req, res } = createNextMocks({
                method: "GET",
                query: { provider, name, identityCommitment: "1" }
            })

            await getMerkleTreeProof(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.root).not.toBeUndefined()
        })
    })
})
