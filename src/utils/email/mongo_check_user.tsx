import {MongoClient } from 'mongodb';
import config from "src/config"

const consoleString = "\u001b[1;32m [Database] \u001b[0m ";

const uri = config.MONGO_URL as string;
const client = new MongoClient(uri);


export async function checkUserStatus(emailAddress:string, rand_id:number) {
    return new Promise(async(resolve, reject) => {

        console.log(`${consoleString} checking db`)
        console.log(emailAddress)
        try {
            await client.connect();
    
            const result = await client.db("email_verification").collection("email_verification").findOne({email: emailAddress});
            if(result){
                // user has been through process, now check if they have been verified yet
                console.log(result)
                if(result.verified == true){
                    console.log(`${consoleString} user is already verified`)
                    resolve("USER_ALREADY_VERIFIED")
                }else{
                    console.log(`${consoleString} user exists but is unverified...updating rand_id`)
                    
                    await client.db("email_verification").collection("email_verification").updateOne({email: emailAddress}, 
                        {
                        $set: {
                            verifierID: rand_id
                        }
                    });
    
                    resolve("USER_EXISTS_UNVERIFIED")
                }
            }else{
                // user not been through process yet
                console.log(`${consoleString} User not yet in database`)
                resolve("NEW_USER")
            }
    
        } catch (e) {
            console.error(e);
            reject(e)
        } finally {
            await client.close()
        }
    })
}
