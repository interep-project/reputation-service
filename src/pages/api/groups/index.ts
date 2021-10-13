import { withSentry } from "@sentry/nextjs"
import { getGroupsController } from "src/controllers/groups"

export default withSentry(getGroupsController)
