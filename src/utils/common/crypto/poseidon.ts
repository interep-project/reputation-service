import { poseidon as _poseidon } from "circomlibjs"

/**
 * Creates a Poseidon big number hash.
 * @param values The list of values to hash.
 * @returns The big number hash.
 */
export default function poseidon(...values: string[] | number[] | bigint[]): string {
    values = values.map(BigInt)

    return _poseidon(values).toString()
}
