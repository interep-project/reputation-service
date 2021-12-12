import { withSentry } from "@sentry/nextjs"
import { getMerkleTreeProofController } from "src/controllers/groups"

export default withSentry(getMerkleTreeProofController)
