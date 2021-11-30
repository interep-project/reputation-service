import { EmailUser, EmailUserDocument } from "@interrep/db"
import { sha256 } from "src/utils/common/crypto"
import { clearDatabase, connectDatabase, dropDatabaseAndDisconnect } from "src/utils/backend/testDatabase"
import config from "src/config"
import { EmailDomains, checkEmailAddress, createEmailAccount, createMagicLink } from "."



const email_no_groups = "test@gmail.com"
const email_one_group = "test@hotmail.co.uk"
const email_two_groups = "test@outlook.edu"
const verificationTokenTest = "1234"
const expectedMagicLink = `${config.HOST}/groups/email/1234/test@outlook.edu/outlook+edu`

describe("# core/email", () => {
    beforeAll(async () => {
        await connectDatabase()
    })

    afterAll(async () => {
        await dropDatabaseAndDisconnect()
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

            const emailUserOne = (await EmailUser.findByHashId(
                sha256(email + groupId[0])
            )) as EmailUserDocument


            const emailUserTwo = (await EmailUser.findByHashId(
                sha256(email + groupId[1])
            )) as EmailUserDocument

            expect(emailUserOne.verificationToken).toHaveLength(64)
            expect(emailUserOne.hasJoined).toBeFalsy()
            expect(emailUserTwo.verificationToken).toHaveLength(64)
            expect(emailUserTwo.hasJoined).toBeFalsy()

        })
    })

    describe("Magic link test", () => {
        it("should create the right magic link", async () => {
            const email = email_two_groups
            // const groupId = ["outlook", "edu"]
            const groupId = checkEmailAddress(email_two_groups)

            const link = createMagicLink(email, verificationTokenTest, groupId)

            expect(link).toBe(expectedMagicLink)
        })
    })
})
