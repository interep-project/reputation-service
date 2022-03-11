import { withSentry } from "@sentry/nextjs"
import { getMerkleProofController } from "src/controllers/groups"

export default withSentry(getMerkleProofController)
