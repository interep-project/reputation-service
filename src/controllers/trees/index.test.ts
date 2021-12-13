import { OAuthProvider, ReputationLevel } from "@interrep/reputation"
import { appendLeaf } from "src/core/groups/mts"
import createNextMocks from "src/mocks/createNextMocks"
import seedZeroHashes from "src/utils/backend/seeding/seedZeroHashes"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import getMerkleProof from "./getMerkleProof"

describe("# controllers/groups", () => {
    const rootHash = "1"
    const leafHash = "1"

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# getMerkleProof", () => {
        it("Should return error 405 if the http method is not a GET", async () => {
            const { req, res } = createNextMocks({
                method: "POST"
            })

            await getMerkleProof(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there the query parameters are wrong", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash }
            })

            await getMerkleProof(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 404 if the root does not exist", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash, leafHash }
            })

            await getMerkleProof(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return error 404 if the leaf does not exist", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, leafHash)

            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash, leafHash: "0" }
            })

            await getMerkleProof(req, res)

            expect(res._getStatusCode()).toBe(404)
        })

        it("Should return a Merkle proof", async () => {
            await seedZeroHashes()
            const rootHash = await appendLeaf(OAuthProvider.TWITTER, ReputationLevel.GOLD, leafHash)

            const { req, res } = createNextMocks({
                method: "GET",
                query: { rootHash, leafHash }
            })

            await getMerkleProof(req, res)

            const { data } = res._getData()

            expect(res._getStatusCode()).toBe(200)
            expect(data.root).not.toBeUndefined()
        })
    })
})
