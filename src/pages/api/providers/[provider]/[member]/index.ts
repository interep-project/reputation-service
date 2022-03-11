import { withSentry } from "@sentry/nextjs"
import { hasMemberController } from "src/controllers/providers"

export default withSentry(hasMemberController)
