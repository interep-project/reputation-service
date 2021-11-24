import { ethers } from "ethers"
import { encrypt } from "eth-sig-util"

function stringifiableToHex(value: unknown): string {
    return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)))
}

export function encryptMessage(publicKey: string, message: string): string {
    return stringifiableToHex(encrypt(publicKey, { data: message }, "x25519-xsalsa20-poly1305"))
}

export function encryptMessageWithSalt(publicKey: string, message: string): string {
    const salt = stringifiableToHex(ethers.utils.randomBytes(12))

    const messageWithSalt = JSON.stringify({
        message,
        salt
    })

    return encryptMessage(publicKey, messageWithSalt)
}
