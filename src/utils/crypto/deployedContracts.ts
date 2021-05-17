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
