import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"
import verifyEmailAccount from "src/core/email/verifyEmailAccount"
import logger from 'src/utils/backend/logger';
import config from "src/config"
import { BreadcrumbLink } from "@chakra-ui/breadcrumb";

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

	// console.log(req)
	let id = (req.query.id as string)

	// id comes in form like 6557?email=johnsmith@hotmail.co.uk
	var rand = id.split('?')[0]
    var email = id.split('=')[1]
	logger.silly(`incoming verification link stats ${config.HOST} ${req.headers.host}`)

	// this url will need to be replaced
	if(("http://"+req.headers.host)===(config.HOST)) {
		logger.silly("Domain is matched. Information is from Authentic email");
		logger.silly(`query.id ${req.query.id}`)

		try {
			logger.silly("trying to make account")
			await verifyEmailAccount(email, rand).then((message) => {
				logger.silly("createEmailAccount message", message)
				
				switch(message) {
					case "No account present":
						res.status(401).end(message)
						break;
					case "Email "+email+" not in system":
						res.status(402).end(message)
						break;
					case "Email "+email+" is already verified":
						res.status(201).end(message)
						break;
					case "Email "+email+" has been Successfully verified":
						res.status(200).end(message)
						break;
					default:
						res.status(400).end("Error")
						break;
				}
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
