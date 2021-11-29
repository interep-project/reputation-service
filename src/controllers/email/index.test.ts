import { EmailUser, EmailUserDocument } from "@interrep/db"
import * as nodemailer from "nodemailer"
import createNextMocks from "src/mocks/createNextMocks"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { sha256 } from "src/utils/common/crypto"
import { sendEmailController } from "."

jest.mock("nodemailer", () => ({
    __esModule: true,
    createTransport: jest.fn(() => ({
        sendMail: jest.fn()
    }))
}))

const sendMailMock = nodemailer.createTransport().sendMail as jest.Mock

describe("# controllers/email", () => {
    const groupId = "outlook"
    const email = "test@outlook.com"

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        sendMailMock.mockClear()
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

        it("Should return error 402 if the email is wrong or not supported", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: { email: "test@gmail.com" }
            })

            await sendEmailController(req, res)

            expect(res._getStatusCode()).toBe(402)
        })

        it("Should return 200 and should create an email user in the db", async () => {
            const { req, res } = createNextMocks({
                method: "POST",
                body: { email }
            })

            await sendEmailController(req, res)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId)
            )) as EmailUserDocument

            expect(res._getStatusCode()).toBe(200)
            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })
    })
})
