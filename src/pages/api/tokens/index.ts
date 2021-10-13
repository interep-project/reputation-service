import { withSentry } from "@sentry/nextjs"
import { getTokensByAddressController } from "src/controllers/tokens"

export default withSentry(getTokensByAddressController)
