import { withSentry } from "@sentry/nextjs"
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import createEmailAccount from "src/core/email/createEmailAccount"
import logger from "src/utils/backend/logger"

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        return res.status(405).end()
    }

    const { email, groupId } = JSON.parse(req.body)

    if (!email) {
        return res.status(400).end()
    }

    if (!email.includes("@hotmail")) {
        return res.status(402).send("Invalid email, it must be an @hotmail address")
    }

    try {
        logger.silly("Creating email account")

        const status = await createEmailAccount(email, groupId)

<<<<<<< HEAD
        if (status) {
            return res.status(200).send({ data: true })
        }
=======
	logger.silly("**********Checking address & sending email************")
	logger.silly(`Request: ${req.body}`)

	// console.log("req", req)
	console.log("req body", req)

	// console.log("req body", JSON.parse(req.body)["address"])
	console.log("req body", req.body["address"])

	// const userEmail = JSON.parse(req.body)["address"]
	const userEmail = req.body["address"]

	// console.log("req", req)
	console.log(userEmail)
	console.log("Email address: ",userEmail)
	var message

	try {
		// -------------------checking email format-----------------
		if(!userEmail || userEmail.includes("@hotmail") != true){
			message = "invalid email, must be an @hotmail address"
			res.status(402).json({ message })
		} else {
			// user has valid hotmail account
			try {
				logger.silly("trying to make account")
				await createEmailAccount(userEmail, "hotmail").then((message) => {
					console.log("createEmailAccount message", message)
					res.status(200).json({message})
				})
		
			} catch (err) {
				console.log(err)
			}
		
		}
	} catch (err) {
		message = "invalid email, must be an @hotmail address"
		res.status(402).json({ message })
	}
>>>>>>> bug: trying to fix sendEmail api string parsing

        return res.status(200).send({ data: false })
    } catch (error) {
        logger.error(error)
        return res.status(500).end()
    }
}

export default withSentry(handler as NextApiHandler)
