import { withSentry } from "@sentry/nextjs"
import { getMerkleTreeLeavesController } from "src/controllers/groups"

export default withSentry(getMerkleTreeLeavesController)
