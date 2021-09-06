import { poseidon } from "circomlib";

export default function poseidonHash(left: string, right: string): string {
  return poseidon([BigInt(left), BigInt(right)]).toString();
}
