import { RequestMethod } from "node-mocks-http"
import * as nodemailer from "nodemailer"
import createNextMocks from "src/mocks/createNextMocks"
import handler from "src/pages/api/email/sendEmail"
import verifyHandler from "src/pages/api/email/verifyEmail"
import logger from "src/utils/backend/logger"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import EmailUser from "../../models/emailUser/EmailUser.model"

// import config from "src/config"

// import linkAccounts from "src/core/email/sendEmail"

// const linkAccountsMocked = linkAccounts as jest.MockedFunction<typeof linkAccounts>

/*
const bodyParams = {
    accountId: "6087dabb0b3af8703a581bef",
    address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    userSignature: "0xSignature",
    userPublicKey: "publicKey"
}
*/

// Set up nodemailer mock
jest.mock('nodemailer', () => ({
    __esModule: true,
    namedExport: { createTransport: jest.fn() },
    default: { createTransport: jest.fn() },
    createTransport: jest.fn().mockImplementation(() => ({ sendMail: jest.fn().mockImplementation(
        (mailOptions: any) => {
            console.log(`sendMail text: ${mailOptions.html}`)
        }
    )}))
}));

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
        //nodemailer.mockImplementation(MockNodemailer)
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
        it("Should return error 405 if the no address", async () => {
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                headers: { "Content-Type": "application/json" },
                body: { address: "" }
            })

            await handler(req, res)
            expect(res._getStatusCode()).toBe(402)
        })

        // // reject email address not from @hotmail
        it("Should return error 405 if wrong type of email entered", async () => {
            const { req, res } = createNextMocks({
                body: { address: "test@outlook.com" },
                method: "POST" as RequestMethod,
                headers: { "Content-Type": "application/json" }
            })

            await handler(req, res)
            expect(res._getStatusCode()).toBe(402)
        })

        it("Should return 200 and be in the db if correct type of email entered (@hotmail)", async () => {
            const TEST_ADDRESS = 'test@hotmail.com'
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                headers: { "Content-Type": "application/json" },
                body: { address: TEST_ADDRESS }
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(200)

            // Account should have been created, but not verified
            const acc = await EmailUser.findByHashId(TEST_ADDRESS)
            logger.silly(`acc ${acc?.id}`)
            expect(acc).toBeDefined()

            expect(acc?.verified).toBeFalsy()

        })

        it("Should verify email", async () => {
            logger.silly(`verify email...`)
            const { req, res } = createNextMocks({
                query: { id: "=1234?email=test@hotmail.co.uk" },
                method: "PUT" as RequestMethod
            })

            const account = new EmailUser({
                provider: "hotmail",
                hashId: "test@hotmail.co.uk",
                verified: false,
                joined: false,
                emailRandomToken: "1234"
            })

            expect(nodemailer.createTransport).toBeDefined()

            await account.save()
            logger.silly(`account.id  ${account?.id}`)

            // expect(sendMailMock).toHaveBeenCalled()

            const acc = await EmailUser.findByHashId(account.hashId)
            expect(acc).toBeDefined()
            logger.silly(`accid  ${acc?.id}`)

            // const link = config.HOST+"/api/email/verifyEmail?id="+"1234"+"?email="+"test@hotmail.co.uk";

            await verifyHandler(req, res)
            expect(res._getStatusCode()).toBe(200)
        })
    })
})
