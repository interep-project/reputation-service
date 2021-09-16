import TokenController from "src/controllers/TokenController"
import createNextMocks from "src/mocks/createNextMocks"
import handler from "src/pages/api/tokens/mint"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/server/testDatabase"

jest.spyOn(TokenController, "mintToken")

describe("api/linking/checkLink", () => {
    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        await clearDatabase()
    })

    it("should return a 405 if method is not POST", async () => {
        const { req, res } = createNextMocks({
            method: "GET"
        })

        await handler(req, res)

        expect(res._getStatusCode()).toBe(405)
    })

    it("should call mintToken", async () => {
        const { req, res } = createNextMocks({
            method: "POST"
        })

        await handler(req, res)

        expect(TokenController.mintToken).toHaveBeenCalledWith(req, res)
    })
})
