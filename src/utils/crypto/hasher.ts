import bigInt from "big-integer";
import { mimcsponge } from "circomlib";

export default function mimcSpongeHash(left: string, right: string): string {
  return mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString();
}
