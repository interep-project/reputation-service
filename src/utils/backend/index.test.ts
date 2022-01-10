import createNextMocks from "src/mocks/createNextMocks"
import getCors from "./getCors"
import removeDBFields from "./removeDBFields"
import runAPIMiddleware from "./runAPIMiddleware"

describe("# utils/backend", () => {
    describe("# removeDBFields", () => {
        it("Should remove the database fields", () => {
            const dbDocument = { _id: 1, __v: 2, a: 3 }

            const expectedValue = removeDBFields(dbDocument)

            expect(expectedValue).not.toHaveProperty("_id")
            expect(expectedValue).not.toHaveProperty("__v")
            expect(expectedValue).toHaveProperty("a")
        })
    })

    describe("# runAPIMiddleware", () => {
        it("Should save the origin domain as allowed in the response headers", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                headers: {
                    origin: "https://interrep.link"
                }
            })

            await runAPIMiddleware(req, res, getCors())
            const expectedValue = res.getHeader("Access-Control-Allow-Origin")

            expect(expectedValue).toBe("https://interrep.link")
        })

        it("Should fail if the origin is not part of the whitelist", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                headers: {
                    origin: "https://example.com"
                }
            })

            const fun = () => runAPIMiddleware(req, res, getCors())

            await expect(fun).rejects.toThrow("not authorized")
        })
    })
})
