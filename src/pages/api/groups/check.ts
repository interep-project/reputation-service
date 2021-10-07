import { withSentry } from "@sentry/nextjs"
import { hasJoinedAGroupController } from "src/controllers/groups"

export default withSentry(hasJoinedAGroupController)
