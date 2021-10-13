import { ethers } from "ethers"
import { encrypt } from "eth-sig-util"

function stringifiableToHex(value: unknown): string {
    return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)))
}

export const encryptMessage = (publicKey: string, message: string): string =>
    stringifiableToHex(encrypt(publicKey, { data: message }, "x25519-xsalsa20-poly1305"))

export const encryptMessageWithSalt = (publicKey: string, message: string): string => {
    const salt = stringifiableToHex(ethers.utils.randomBytes(12))

    const messageWithSalt = JSON.stringify({
        message,
        salt
    })

    return encryptMessage(publicKey, messageWithSalt)
}
