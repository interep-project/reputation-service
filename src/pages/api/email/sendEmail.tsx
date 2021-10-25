import config from "src/config"
import {addUnverifiedUser } from  '../../../utils/email/mongo_add_user';
import {checkUserStatus } from '../../../utils/email/mongo_check_user';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { withSentry } from "@sentry/nextjs"

var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
	host: 'smtp.gmail.com',
    auth: {
		type: "OAuth2",
        user: config.GMAIL_ADDRESS,
		clientId: config.GMAIL_CLIENT_ID,
		clientSecret: config.GMAIL_CLIENT_SECRET,
		refreshToken: config.GMAIL_REFRESH_TOKEN,
		accessToken: config.GMAIL_ACCESS_TOKEN 
    } 
});


async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {

	console.log("**********Checking address & sending email************")

	const userEmail = req.body.address
	console.log(userEmail)
	// console.log("Email address: ",userEmail)
	var message

	// -------------------checking email format-----------------
	if(userEmail.includes("@hotmail") != true){
		message = "invalid email, must be an @hotmail address"
        res.status(402).json({ message })
	}

	// -------------------checking user is new-----------------
	var rand=Math.floor((Math.random() * 10000));

	checkUserStatus(userEmail, rand).then((result) => {
		// user is already verified so end process
		if(result == "USER_ALREADY_VERIFIED"){
			message = userEmail + " is already verified"
			res.status(400).json({ message })
		}else{
			// user is new
			var link="http://"+req.headers.host+"/api/email/verifyEmail?id="+rand+"?email="+userEmail;

			var mailOptions={
				to : userEmail,
				subject : "Interrep email confirmation",
				html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
			}

			smtpTransport.sendMail(mailOptions, function(error:any, response:NextApiResponse){
				if(error){
					message = "Error sending email to " + userEmail
					res.status(401).json({ message })
				}else{
                    message = "Verification email sent, please check your inbox (might be in spam)"
                    // if user didn't exist add user, else leave user entry alone
                    if(result=="NEW_USER"){
                        addUnverifiedUser(userEmail, rand).then((result) => {
                            console.log("adding user to db")                            
                        }).catch((err) => {
							message = "Error adding user to database "
							res.status(401).json({ message })
                        })
                    }
                    res.status(200).json({ message })
					
				} // end else
			}) // end smtpTransport
		} // end else
	}) // end checkUnverifiedUserAsny
}

export default withSentry(handler as NextApiHandler)
