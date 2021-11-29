import { withSentry } from "@sentry/nextjs"
import { hasIdentityCommitmentController } from "src/controllers/groups/"

export default withSentry(hasIdentityCommitmentController)
// hasIdentityCommitmentController)
