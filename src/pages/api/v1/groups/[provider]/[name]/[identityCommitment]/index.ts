import { withSentry } from "@sentry/nextjs"
import { handleIdentityCommitmentController } from "src/controllers/groups"

export default withSentry(handleIdentityCommitmentController)
