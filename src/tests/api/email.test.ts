import { EmailUser } from "@interrep/db"
import { RequestMethod } from "node-mocks-http"
import * as nodemailer from "nodemailer"
import createNextMocks from "src/mocks/createNextMocks"
import handler from "src/pages/api/email/sendEmail"
import logger from "src/utils/backend/logger"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"

/*
const bodyParams = {
    accountId: "6087dabb0b3af8703a581bef",
    address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    userSignature: "0xSignature",
    userPublicKey: "publicKey"
}
*/

// Set up nodemailer mock.
jest.mock("nodemailer", () => ({
    __esModule: true,
    namedExport: { createTransport: jest.fn() },
    default: { createTransport: jest.fn() },
    createTransport: jest.fn().mockImplementation(() => ({
        sendMail: jest.fn().mockImplementation((mailOptions: any) => {
            console.log(`sendMail text: ${mailOptions.html}`)
        })
    }))
}))

// const MockNodemailer = () => {
//     createTransport: jest.fn().mockImplementation(() => ({ sendMail: jest.fn().mockImplementation(
//         (mailOptions: any) => {
//             console.log(`sendMail text: ${mailOptions.html}`)
//         }
//     ) }))
// }

const sendMailMock = nodemailer.createTransport().sendMail as jest.Mock

describe("Email verification APIs", () => {
    beforeAll(async () => {
        await connectDatabase()
        // @ts-ignore
        // nodemailer.mockImplementation(MockNodemailer)
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    beforeEach(async () => {
        sendMailMock.mockClear()
    })

    afterEach(async () => {
        logger.silly(`clear DB`)
        await clearDatabase()
    })

    describe("Get user reputation", () => {
        it("Should return error 400 if the no address", async () => {
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                body: { address: "" }
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        // // reject email address not from @hotmail
        it("Should return error 400 if wrong type of email entered", async () => {
            const { req, res } = createNextMocks({
                body: { address: "test@outlook.com" },
                method: "POST" as RequestMethod
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
        })

        it("Should return 200 and be in the db if correct type of email entered (@hotmail)", async () => {
            const TEST_ADDRESS = "test@hotmail.com"
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                body: { email: TEST_ADDRESS }
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(200)

            // Account should have been created, but not verified.
            const acc = await EmailUser.findByHashId(TEST_ADDRESS)
            logger.silly(`acc ${acc?.id}`)

            expect(acc).toBeDefined()
        })

        it("Should return 200 with previously verified account", async () => {
            const TEST_ADDRESS = "test@hotmail.com"

            EmailUser.create({
                hashId: TEST_ADDRESS,
                hasJoined: false,
                verificationToken: "1234"
            })

            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                body: { email: TEST_ADDRESS }
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(200)

            // Account should still be there.
            const acc = await EmailUser.findByHashId(TEST_ADDRESS)

            expect(acc).toBeDefined()
        })
    })
})
