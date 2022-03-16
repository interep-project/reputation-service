import { withSentry } from "@sentry/nextjs"
import { getRootBatchController } from "src/controllers/batches"

export default withSentry(getRootBatchController)
