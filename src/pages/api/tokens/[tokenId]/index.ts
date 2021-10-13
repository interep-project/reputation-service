import { withSentry } from "@sentry/nextjs"
import { getTokenController } from "src/controllers/tokens"

export default withSentry(getTokenController)
