import { withSentry } from "@sentry/nextjs"
import { getGroupRemovedMembersController } from "src/controllers/groups"

export default withSentry(getGroupRemovedMembersController)