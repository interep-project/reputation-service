import { withSentry } from "@sentry/nextjs"
import { getMerkleProofController } from "src/controllers/trees"

export default withSentry(getMerkleProofController)
