import { EmailUser, EmailUserDocument } from "@interrep/db"
import { sha256 } from "src/utils/common/crypto"
import * as nodemailer from "nodemailer"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import { sendEmail, EmailDomains, checkEmailAddress, createEmailAccount } from "."


jest.mock("nodemailer", () => ({
    __esModule: true,
    createTransport: jest.fn(() => ({
        sendMail: jest.fn()
    }))
}))

const sendMailMock = nodemailer.createTransport().sendMail as jest.Mock

const email_no_groups = "test@gmail.com"
const email_one_group = "test@hotmail.co.uk"
const email_two_groups = "test@outlook.edu"
const verificationTokenTest = "1234"

describe("# core/email", () => {
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

    describe("Email domain checks", () => {
        it("Should return correct string check value from email group", () => {
            const expectedValue = EmailDomains.hotmail
            expect(expectedValue).toBe("@hotmail")
        })

        it("Should return return groupId list of length 0 for email matching no groups", () => {
            const expectedValue = checkEmailAddress(email_no_groups)
            expect(expectedValue).toHaveLength(0)
        })

        it("Should return return groupId list of length 1 for email matching 1 group", () => {
            const expectedValue = checkEmailAddress(email_one_group)
            expect(expectedValue).toHaveLength(1)
        })

        it("Should return return groupId list with correct entry", () => {
            const expectedValue = checkEmailAddress(email_one_group)
            const expectedGroup = expectedValue[0]
            expect(expectedGroup).toBe("hotmail")
        })

        it("Should return return groupId list of length 2 for email matching 2 groups", () => {
            const expectedValue = checkEmailAddress(email_two_groups)
            expect(expectedValue).toHaveLength(2)
        })
    })

    describe("create email account tests", () => {
        it("Should create 1 email account for user with one group", async () => {
            const email = email_one_group
            const groupId = ["hotmail"]

            await createEmailAccount(email, groupId)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId[0])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })

        it("Should create 2 email accounts for user with two groups", async () => {
            const email = email_two_groups
            const groupId = ["hotmail", "edu"]

            await createEmailAccount(email, groupId)

            var { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId[0])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()

            var { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId[1])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })
    })

    describe("send email tests", () => {
        it("should create the right email link", async () => {
            const email = email_one_group
            const groupId = ["hotmail"]

            await createEmailAccount(email, groupId)

            const { hasJoined, verificationToken } = (await EmailUser.findByHashId(
                sha256(email + groupId[0])
            )) as EmailUserDocument

            expect(verificationToken).toHaveLength(64)
            expect(hasJoined).toBeFalsy()
        })
    })
})
