import { DeployedContracts } from "src/utils/crypto/deployedContracts";

const metadataByBadge = {
  twitter: {
    description: "InterRep reputation badge for a Twitter account.",
    name: "InterRep Twitter Reputation Badge",
    image: "",
  },
};

export const getNFTMetadataObject = (deployedContract: DeployedContracts) => {
  if (deployedContract === DeployedContracts.TWITTER_BADGE) {
    return metadataByBadge["twitter"];
  }
  return null;
};
