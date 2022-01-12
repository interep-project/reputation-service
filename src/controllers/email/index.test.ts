import { EmailUser, EmailUserDocument } from "@interrep/db"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, disconnectDatabase } from "src/utils/backend/testingDatabase"
import { connectDatabase as _connectDatabase } from "src/utils/backend/database"
import { sha256 } from "src/utils/common/crypto"
import { sendEmailController } from "."

jest.mock("src/utils/backend/database", () => ({
    __esModule: true,
    connectDatabase: jest.fn()
}))

jest.mock("nodemailer", () => ({
    __esModule: true,
    createTransport: jest.fn(() => ({
        sendMail: jest.fn()
    }))
}))

describe("# controllers/email", () => {
    const groupId = "outlook"
    const email = "test@outlook.com"

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await disconnectDatabase()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# sendEmail", () => {
        it("Should return error 405 if the http method is not a POST", async () => {
            const { req, res } = createNextMocks({
                method: "GET",
                body: { email }
            })

            await sendEmailController(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return error 400 if there is no email parameter", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: {}
            })

            await sendEmailController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 400 if the email is wrong or not supported", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: { email: "test@gmail.com" }
            })

            await sendEmailController(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return error 500 if there is an unexpected error", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: { email }
            })

            ;(_connectDatabase as any).mockImplementationOnce(() => {
                throw new Error("Error")
            })

            await sendEmailController(req, res)

            expect(res._getStatusCode()).toBe(500)
        })

        it("Should create an email user in the db", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: { email }
            })

            await sendEmailController(req, res)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId)
            )) as EmailUserDocument

            expect(res._getStatusCode()).toBe(201)
            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })
    })
})
