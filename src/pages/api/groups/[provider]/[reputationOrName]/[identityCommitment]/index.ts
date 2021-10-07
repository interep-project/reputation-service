import { withSentry } from "@sentry/nextjs"
import { addIdentityCommitmentController } from "src/controllers/groups"

export default withSentry(addIdentityCommitmentController)
