import { withSentry } from "@sentry/nextjs"
import { getTokenController } from "src/controllers/badges"

export default withSentry(getTokenController)
