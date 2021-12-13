import { withSentry } from "@sentry/nextjs"
import { hasLeafController } from "src/controllers/trees"

export default withSentry(hasLeafController)
