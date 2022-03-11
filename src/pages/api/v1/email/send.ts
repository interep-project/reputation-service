import { withSentry } from "@sentry/nextjs"
import { sendEmailController } from "src/controllers/email"

export default withSentry(sendEmailController)
