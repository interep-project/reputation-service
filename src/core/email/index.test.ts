import { EmailUser, EmailUserDocument } from "@interrep/db"
import config from "src/config"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { sha256 } from "src/utils/common/crypto"
import getEmailDomainsByEmail from "./getEmailDomainsByEmail"
import createEmailAccount from "./createEmailAccount"
import createMagicLink from "./createMagicLink"
import EmailDomain from "./emailDomain"
import getEmailDomains from "./getEmailDomains"

jest.mock("nodemailer", () => ({
    __esModule: true,
    createTransport: jest.fn(() => ({
        sendMail: jest.fn()
    }))
}))

describe("# core/email", () => {
    const verificationTokenTest = "1234"
    const expectedMagicLink = `${config.NEXTAUTH_URL}/groups/email/${verificationTokenTest}/test@outlook.edu/outlook+edu`

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# getEmailDomainsByEmail", () => {
        it("Should return an empty list if the email is not well formatted", () => {
            const expectedValue1 = getEmailDomainsByEmail("@outlook")
            const expectedValue2 = getEmailDomainsByEmail("@outlook@outlook.com")

            expect(expectedValue1).toHaveLength(0)
            expect(expectedValue2).toHaveLength(0)
        })

        it("Should return a valid domain if the email is well formatted", () => {
            const expectedValue = getEmailDomainsByEmail("test@outlook.com")

            expect(expectedValue).toHaveLength(1)
        })

        it("Should not return an empty list if the email is not supported", () => {
            const expectedValue = getEmailDomainsByEmail("test@gmail.com")

            expect(expectedValue).toHaveLength(0)
        })

        it("Should return an hotmail domain", () => {
            const expectedValue = getEmailDomainsByEmail("test@hotmail.co.uk")

            expect(expectedValue[0]).toBe(EmailDomain.HOTMAIL)
        })

        it("Should two valid domains", () => {
            const expectedValue = getEmailDomainsByEmail("test@outlook.edu")

            expect(expectedValue).toHaveLength(2)
        })
    })

    describe("# createEmailAccount", () => {
        it("Should create 1 email account", async () => {
            const email = "test@hotmail.co.uk"
            const emailDomains = [EmailDomain.HOTMAIL]

            await createEmailAccount(email, emailDomains)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + emailDomains[0])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })

        it("Should create 2 email accounts", async () => {
            const email = "test@outlook.edu"
            const emailDomains = [EmailDomain.OUTLOOK, EmailDomain.EDU]

            await createEmailAccount(email, emailDomains)

            const emailUser1 = (await EmailUser.findByHashId(sha256(email + emailDomains[0]))) as EmailUserDocument
            const emailUser2 = (await EmailUser.findByHashId(sha256(email + emailDomains[1]))) as EmailUserDocument

            expect(emailUser1.verificationToken).toHaveLength(64)
            expect(emailUser1.hasJoined).toBeFalsy()
            expect(emailUser2.verificationToken).toHaveLength(64)
            expect(emailUser2.hasJoined).toBeFalsy()
        })
    })

    describe("# createMagicLink", () => {
        it("should create the right magic link", async () => {
            const email = "test@outlook.edu"
            const emailDomains = [EmailDomain.OUTLOOK, EmailDomain.EDU]

            const link = createMagicLink(email, verificationTokenTest, emailDomains)

            expect(link).toBe(expectedMagicLink)
        })
    })

    describe("# getEmailDomains", () => {
        it("should return a list of supported email domains", async () => {
            const expectedValue = getEmailDomains()

            expect(expectedValue.length).toBeGreaterThan(0)
        })
    })
})
