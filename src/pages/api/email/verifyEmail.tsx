import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import verifyEmailAccount from "src/core/email/verifyEmailAccount"
import config from "src/config"

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

	console.log(req)
	let id = (req.query.id as string)

	// id comes in form like 6557?email=johnsmith@hotmail.co.uk
	var rand = id.split('?')[0]
    var email = id.split('=')[1]
	console.log("incoming verification link stats")

	// this url will need to be replaced
	if(("http://"+req.headers.host)==(config.HOST)) {
		console.log("Domain is matched. Information is from Authentic email");
		console.log(req.query.id)

		try {
			console.log("trying to make account")
			await verifyEmailAccount(email, rand).then((message) => {
				console.log("createEmailAccount message", message)
				res.status(200).end(message)
			})
	
		} catch (err) {
			console.log(err)
			res.status(401).end(err)
		}
		
	} else {
		res.status(402).end("Request is from unknown source");
	}
};

export default withSentry(handler as NextApiHandler)
