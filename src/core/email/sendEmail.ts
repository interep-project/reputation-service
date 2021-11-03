import config from "src/config"
// import sendEmail from "src/pages/api/email/sendEmail";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next"

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

export default async function sendEmail(emailAddress:String, randToken:String): Promise<string | void> {

    // var link="http://"+host+"/api/email/verifyEmail?id="+randToken+"?email="+emailAddress;
    var link="http://localhost:3000"+"/api/email/verifyEmail?id="+randToken+"?email="+emailAddress;
    var mailOptions={
        to : emailAddress,
        subject : "Interrep email confirmation",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
    }
    var message;

    console.log("in send email file")      
    await smtpTransport.sendMail(mailOptions, function(error:any, response:string){
        if(error){
            message = "Error sending email to " + emailAddress
            console.log("error sending email", error)      
            return message
        }else{
            message = "Verification email sent, please check your inbox (might be in spam)"   
            console.log("successfully sent email", response)         
            return message
            
        } // end else
    }) // end smtpTransport
}

