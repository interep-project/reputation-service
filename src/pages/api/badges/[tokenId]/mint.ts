import { withSentry } from "@sentry/nextjs"
import { mintTokenController } from "src/controllers/badges"

export default withSentry(mintTokenController)
