import { EmailUser, EmailUserDocument } from "@interrep/db"
import config from "src/config"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { sha256 } from "src/utils/common/crypto"
import { checkEmailAddress, createEmailAccount, createMagicLink, EmailDomain } from "."
import getEmailDomains from "./getEmailDomains"

jest.mock("nodemailer", () => ({
    __esModule: true,
    createTransport: jest.fn(() => ({
        sendMail: jest.fn()
    }))
}))

describe("# core/email", () => {
    const emailNoGroups = "test@gmail.com"
    const email1Group = "test@hotmail.co.uk"
    const email2Groups = "test@outlook.edu"
    const verificationTokenTest = "1234"
    const expectedMagicLink = `${config.NEXTAUTH_URL}/groups/email/1234/test@outlook.edu/outlook+edu`

    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
    })

    afterEach(async () => {
        await clearDatabase()
    })

    describe("# checkEmailAddress", () => {
        describe("regex checks", () => {

            it("regex test 1 should return groupId len 0", () => {
                const expectedValue = checkEmailAddress("@outlook")
                expect(expectedValue).toHaveLength(0)
            })

            it("regex test 2 should return groupId len 0", () => {
                const expectedValue = checkEmailAddress("@outlook@outlook.com")
                expect(expectedValue).toHaveLength(0)
            })

            it("regex test 3 should return groupId len 1", () => {
                const expectedValue = checkEmailAddress("test@outlook.com")
                expect(expectedValue).toHaveLength(1)
            })


        })

        describe("# other checks", () => {

            it("Should return correct string check value from email group", () => {
                const expectedValue = EmailDomain.hotmail
                expect(expectedValue).toBe("hotmail")
            })

            it("Should return return groupId list of length 0 for email matching no groups", () => {
                const expectedValue = checkEmailAddress(emailNoGroups)
                expect(expectedValue).toHaveLength(0)
            })

            it("Should return return groupId list of length 1 for email matching 1 group", () => {
                const expectedValue = checkEmailAddress(email1Group)
                expect(expectedValue).toHaveLength(1)
            })

            it("Should return return groupId list with correct entry", () => {
                const expectedValue = checkEmailAddress(email1Group)
                const expectedGroup = expectedValue[0]
                expect(expectedGroup).toBe("hotmail")
            })

            it("Should return return groupId list of length 2 for email matching 2 groups", () => {
                const expectedValue = checkEmailAddress(email2Groups)
                expect(expectedValue).toHaveLength(2)
            })

        })
    })

    describe("# createEmailAccount", () => {
        it("Should create 1 email account for user with one group", async () => {
            const email = email1Group
            const groupId = ["hotmail"]

            await createEmailAccount(email, groupId)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId[0])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })

        it("Should create 2 email accounts for user with two groups", async () => {
            const email = email2Groups
            const groupId = ["hotmail", "edu"]

            await createEmailAccount(email, groupId)

            const emailUser1 = (await EmailUser.findByHashId(sha256(email + groupId[0]))) as EmailUserDocument
            const emailUser2 = (await EmailUser.findByHashId(sha256(email + groupId[1]))) as EmailUserDocument

            expect(emailUser1.verificationToken).toHaveLength(64)
            expect(emailUser1.hasJoined).toBeFalsy()
            expect(emailUser2.verificationToken).toHaveLength(64)
            expect(emailUser2.hasJoined).toBeFalsy()
        })
    })

    describe("# createMagicLink", () => {
        it("should create the right magic link", async () => {
            const email = email2Groups
            const groupId = checkEmailAddress(email2Groups)

            const link = createMagicLink(email, verificationTokenTest, groupId)

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
