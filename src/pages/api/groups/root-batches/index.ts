import { withSentry } from "@sentry/nextjs"
import { getMerkleTreeRootBatchesController } from "src/controllers/groups"

export default withSentry(getMerkleTreeRootBatchesController)
