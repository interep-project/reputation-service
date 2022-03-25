import { withSentry } from "@sentry/nextjs"
import { getGroupMembersController } from "src/controllers/groups"

export default withSentry(getGroupMembersController)
