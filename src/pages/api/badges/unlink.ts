import { withSentry } from "@sentry/nextjs"
import unlinkAccountsController from "src/controllers/badges/unlinkAccounts"

export default withSentry(unlinkAccountsController)
