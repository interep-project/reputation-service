import { withSentry } from "@sentry/nextjs"
import { getMerkleTreeRootBatchController } from "src/controllers/groups"

export default withSentry(getMerkleTreeRootBatchController)
