import { ethers } from "ethers"
import { encrypt } from "eth-sig-util"

/**
 * Converts a stringifiable value to hexadecimal.
 * @param value The stringifiable value.
 * @returns The hexadecimal value.
 */
function stringifiableToHex(value: unknown): string {
    return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)))
}

/**
 * Encrypts a message with a public key.
 * @param publicKey The public key.
 * @param message The message to encrypt.
 * @returns The hexadecimal encrypted message.
 */
export function encryptMessage(publicKey: string, message: string): string {
    return stringifiableToHex(encrypt(publicKey, { data: message }, "x25519-xsalsa20-poly1305"))
}

/**
 * Encrypts a message with a public key using salt.
 * @param publicKey The public key.
 * @param message The message to encrypt.
 * @returns The hexadecimal encrypted message.
 */
export function encryptMessageWithSalt(publicKey: string, message: string): string {
    const salt = stringifiableToHex(ethers.utils.randomBytes(12))
    const messageWithSalt = JSON.stringify([message, salt])

    return encryptMessage(publicKey, messageWithSalt)
}
