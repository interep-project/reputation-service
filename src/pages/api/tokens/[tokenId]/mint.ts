import { withSentry } from "@sentry/nextjs"
import { mintTokenController } from "src/controllers/tokens"

export default withSentry(mintTokenController)
