import { withSentry } from "@sentry/nextjs"
import { getProvidersController } from "src/controllers/providers"

export default withSentry(getProvidersController)
