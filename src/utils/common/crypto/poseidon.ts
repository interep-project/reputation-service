import { poseidon as _poseidon } from "circomlibjs"

export default function poseidon(...values: string[] | number[] | bigint[]): string {
    values = values.map(BigInt)

    return _poseidon(values).toString()
}
