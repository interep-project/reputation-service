import { model, models } from "mongoose"
import EmailUserSchema from "./EmailUser.schema"
import type { EmailUserDocument, EmailUserModel } from "./EmailUser.types"

const EMAIL_USER_MODEL_NAME = "EmailUser"

const EmailUser: EmailUserModel =
    (models[EMAIL_USER_MODEL_NAME] as EmailUserModel) ||
    model<EmailUserDocument, EmailUserModel>(EMAIL_USER_MODEL_NAME, EmailUserSchema, "emailUsers")

export default EmailUser
