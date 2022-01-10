import { sha256 as _sha256 } from "js-sha256"

/**
 * Returns an hexadecimal sha256 hash of the message passed as parameter.
 * @param message The string to hash.
 * @returns The hexadecimal hash of the message.
 */
export default function sha256(message: string): string {
    const hash = _sha256.create()

    hash.update(message)

    return hash.hex()
}
