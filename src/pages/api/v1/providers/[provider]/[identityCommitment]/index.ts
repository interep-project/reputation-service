import { withSentry } from "@sentry/nextjs"
import { hasIdentityCommitmentController } from "src/controllers/providers"

export default withSentry(hasIdentityCommitmentController)
