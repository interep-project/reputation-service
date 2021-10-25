import {MongoClient } from 'mongodb';
import config from "src/config"

const consoleString = "\u001b[1;32m [Database] \u001b[0m ";

const uri = config.MONGO_URL as string;
const client = new MongoClient(uri);

export async function addUnverifiedUser(emailAddress:string, id:number) {
    return new Promise(async(resolve, reject) => {

        console.log(`${consoleString} checking db`)
        try {
            await client.connect();
    
            var userDetails = {
                email: emailAddress,
                verifierID: id,
                verified: false
            }
            await client.db("email_verification").collection("email_verification").insertOne(userDetails);
            console.log(`${consoleString} User ${emailAddress} added to db`)
            resolve(true)

        } catch (e) {
            console.error(e);
            reject(e)
        } finally {
            await client.close()
        }
    })
}

