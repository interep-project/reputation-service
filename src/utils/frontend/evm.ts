import { DisplayableChainNames } from "src/types/chains";
import { getChecksummedAddress } from "src/utils/crypto/address";

const isKnownChainId = (id: number): id is keyof typeof DisplayableChainNames =>
  id in DisplayableChainNames;

export const getChainNameFromNetworkId = (id: number): string | null => {
  return isKnownChainId(id) ? DisplayableChainNames[id] : null;
};

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = getChecksummedAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`;
}
