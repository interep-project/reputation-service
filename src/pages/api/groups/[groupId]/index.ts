import { withSentry } from "@sentry/nextjs"
import GroupsController from "src/controllers/groups"

export default withSentry(GroupsController.getGroup)
