import {verifyUser } from  '../../../utils/email/mongo_verify_user';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

	let id = (req.query.id as string)

	// id comes in form like 6557?email=johnsmith@hotmail.co.uk
	var rand = id.split('?')[0]
    var email = id.split('=')[1]
	console.log("incoming verification link stats")

	// this url will need to be replaced
	if(("http://"+req.headers.host)==("http://localhost:3000")) {
		console.log("Domain is matched. Information is from Authentic email");
		console.log(req.query.id)

		verifyUser(email,rand).then((result) => {
			if(result == "VERIFIED_USER") {
				console.log("email is verified");
				res.end("Email "+email+" has been Successfully verified");
			}else if(result == "USER_ALREADY_VERIFIED") {
				console.log("email already verified");
				res.end("Email "+email+" is already verified");
			}else{
                res.end("Email "+email+" not in system");
            }
		}).catch((err) => {
			console.log(err)
		})
	
	} else {
		res.end("Request is from unknown source");
	}
};

export default withSentry(handler as NextApiHandler)
