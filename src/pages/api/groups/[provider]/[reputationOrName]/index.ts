import { withSentry } from "@sentry/nextjs"
import { getGroupController } from "src/controllers/groups"

export default withSentry(getGroupController)
