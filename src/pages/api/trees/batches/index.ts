import { withSentry } from "@sentry/nextjs"
import { getRootBatchesController } from "src/controllers/trees"

export default withSentry(getRootBatchesController)
