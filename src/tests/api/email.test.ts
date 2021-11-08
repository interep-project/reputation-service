import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import EmailUser from "../../models/emailUser/EmailUser.model"
import handler from "src/pages/api/email/sendEmail"
import verifyHandler from "src/pages/api/email/verifyEmail"

import createNextMocks from "src/mocks/createNextMocks"
import { RequestMethod } from "node-mocks-http"
// import fetchMock from "jest-fetch-mock";

//import config from "src/config"

//import linkAccounts from "src/core/email/sendEmail"

//const linkAccountsMocked = linkAccounts as jest.MockedFunction<typeof linkAccounts>

/*
const bodyParams = {
    accountId: "6087dabb0b3af8703a581bef",
    address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    userSignature: "0xSignature",
    userPublicKey: "publicKey"
}
*/

describe("Email verification APIs", () => {
    beforeAll(async () => {
        await connect()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("Get user reputation", () => {

        // return error if no email address given
        it("Should return error 405 if the no address", async () => {
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
            })
    
            await handler(req, res)
            expect(res._getStatusCode()).toBe(402)
        })

        it("Should return 200 if correct type of email entered (@hotmail) ", async () => {
            const { req, res } = createNextMocks({
                method: "POST" as RequestMethod,
                headers: { 'Content-Type': 'application/json' },
                body: { address: "test@hotmail.com" }
            })
    
            await handler(req, res)
            expect(res._getStatusCode()).toBe(200)
        })

        it("Should return 200 if correct type of email entered (@hotmail) ", async () => {
            const { req, res } = createNextMocks({
                query: {id: "="+"1234"+"?email="+"test@hotmail.co.uk"},
                method: "PUT" as RequestMethod,
            })

            const account = new EmailUser({
                provider: "hotmail",
                hashId: "test@hotmail.co.uk",
                verified: false,
                joined: false,
                emailRandomToken: "1234"
            })

            await account.save()

            // const link = config.HOST+"/api/email/verifyEmail?id="+"1234"+"?email="+"test@hotmail.co.uk";
            
            await verifyHandler(req, res)
            expect(res._getStatusCode()).toBe(200)
        })



    })
})
