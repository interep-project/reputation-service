import { withSentry } from "@sentry/nextjs"
import { isLinkedToAddressController } from "src/controllers/badges"

export default withSentry(isLinkedToAddressController)
