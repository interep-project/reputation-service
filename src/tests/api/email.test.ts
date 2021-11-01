import getReputation from "src/pages/api/reputation/[web2Provider]/[username]"
import { clearDatabase, connect, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import createNextMocks from "src/mocks/createNextMocks"
import { ReputationLevel, Web2Provider } from "@interrep/reputation-criteria"

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
        it("Should return a 405 if the method is not GET", async () => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address: "" })
            };
            const response = await fetch('/api/email/sendEmail', requestOptions);
            const data = await response.json();

            expect(data._getStatusCode()).toBe(405)
        })

        // reject email address not from @hotmail
        it("Should return a 405 if the method is not GET", async () => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address: "test@outlook.com" })
            };
            const response = await fetch('/api/email/sendEmail', requestOptions);
            const data = await response.json();

            expect(data._getStatusCode()).toBe(405)
        })

        it("Should return a 405 if the method is not GET", async () => {
            const { req, res } = createNextMocks({
                query: {},
                method: "PUT"
            })

            await getReputation(req, res)

            expect(res._getStatusCode()).toBe(405)
        })

        it("Should return the user reputation", async () => {
            const web2Provider = Web2Provider.TWITTER
            const username = "username"

            const { req, res } = createNextMocks({
                query: { web2Provider, username }
            })

            await getReputation(req, res)

            expect(res._getData().data.reputation).toBe(ReputationLevel.GOLD)
        })
    })
})
