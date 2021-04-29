import { getAddress } from "@ethersproject/address";

// returns the checksummed address if the address is valid, otherwise returns null
export function getChecksummedAddress(value: any): string | null {
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}
