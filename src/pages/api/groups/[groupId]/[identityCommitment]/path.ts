import { withSentry } from "@sentry/nextjs"
import { getMerkleTreePathController } from "src/controllers/groups"

export default withSentry(getMerkleTreePathController)
