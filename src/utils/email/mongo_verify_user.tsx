import {MongoClient } from 'mongodb';
import config from "src/config"

const consoleString = "\u001b[1;32m [Database] \u001b[0m ";

const uri = config.MONGO_URL as string;
const client = new MongoClient(uri);

export async function verifyUser(emailAddress:string, id:number) {
    return new Promise(async(resolve, reject) => {

        try {
            await client.connect();

            const user = await client.db("email_verification").collection("email_verification").findOne({email: emailAddress});

            const userID = user.verifierID

            // if id in database matches same one from email link
            if(userID == id) {
                if(user.verified==true){
                    resolve("USER_ALREADY_VERIFIED")
                }else{
                    // update user details to have verified = true
                    await client.db("email_verification").collection("email_verification").updateOne({email: emailAddress}, 
                        {
                        $set: {
                            verified: true
                        }
                    });

                    console.log(`${consoleString} unverified user check result TRUE`)
                    resolve("VERIFIED_USER")
                }
            }else{
                console.log(`${consoleString} unverified user check result FALSE`)
                resolve("USER_CHECK_FAILED")
            }


        } catch (e) {
            reject(e);
        } finally {
            await client.close()
        }
    })
}
