import { withSentry } from "@sentry/nextjs"
import { getRootBatchesController } from "src/controllers/batches"

export default withSentry(getRootBatchesController)
