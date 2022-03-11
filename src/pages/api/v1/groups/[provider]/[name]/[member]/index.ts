import { withSentry } from "@sentry/nextjs"
import { handleMemberController } from "src/controllers/groups"

export default withSentry(handleMemberController)
