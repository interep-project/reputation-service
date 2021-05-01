import Token from "./Token.model";
import { ITokenDocument } from "./Token.types";

export async function findByUserAddress(
  this: typeof Token,
  address: string
): Promise<ITokenDocument[] | null> {
  return this.find({ userAddress: address });
}
