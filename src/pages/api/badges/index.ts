import { withSentry } from "@sentry/nextjs"
import { getTokensByAddressController } from "src/controllers/badges"

export default withSentry(getTokensByAddressController)
