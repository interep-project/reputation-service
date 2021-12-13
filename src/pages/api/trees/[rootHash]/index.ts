import { withSentry } from "@sentry/nextjs"
import { getLeavesController } from "src/controllers/trees"

export default withSentry(getLeavesController)
