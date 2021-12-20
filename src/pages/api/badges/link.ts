import { withSentry } from "@sentry/nextjs"
import { linkAccountsController } from "src/controllers/badges"

export default withSentry(linkAccountsController)
