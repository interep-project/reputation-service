import { withSentry } from "@sentry/nextjs"
import { getRootBatchController } from "src/controllers/trees"

export default withSentry(getRootBatchController)
