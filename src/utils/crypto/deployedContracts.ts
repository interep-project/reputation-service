import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { getDefaultNetworkId } from "./getDefaultNetwork";

export enum DeployedContracts {
  BADGE_FACTORY = "BADGE_FACTORY",
  TWITTER_BADGE = "TWITTER_BADGE",
}

const deployedContracts: {
  [networkId: number]: { [key in DeployedContracts]: string };
} = {
  // hardhat
  31337: {
    [DeployedContracts.BADGE_FACTORY]:
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    [DeployedContracts.TWITTER_BADGE]:
      "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
  },
  42: {
    [DeployedContracts.BADGE_FACTORY]:
      "0xcdd8ff6b388ed0e89263dD77f432aba790383Ae3",
    [DeployedContracts.TWITTER_BADGE]:
      "0x23b06041580d8e6cDb11A56783c9f183B7B8C8B1",
  },
};

export const isNetworkWithDeployedContract = (
  id?: number
): id is keyof typeof deployedContracts => !!id && id in deployedContracts;

export const getDeployedContractAddress = (
  contract: DeployedContracts
): string => {
  const networkId = getDefaultNetworkId();

  return deployedContracts[networkId][contract];
};

export const getBadgeAddressByProvider = (
  web2Provider: Web2Providers
): string => {
  if (web2Provider == Web2Providers.TWITTER) {
    return getDeployedContractAddress(DeployedContracts.TWITTER_BADGE);
  } else {
    throw new Error("Unsupported provider");
  }
};

export default deployedContracts;
