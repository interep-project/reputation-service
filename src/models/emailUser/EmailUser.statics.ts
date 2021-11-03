import type EmailUser from "./EmailUser.model"
import type { EmailUserDocument } from "./EmailUser.types"

// eslint-disable-next-line import/prefer-default-export
export async function findByHashId(this: typeof EmailUser, hashId: string): Promise<EmailUserDocument | null> {
    return this.findOne({ hashId })
}

