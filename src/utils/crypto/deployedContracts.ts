import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { getDefaultNetworkId } from "./getDefaultNetwork";

export enum DeployedContracts {
  TWITTER_BADGE = "TWITTER_BADGE",
}

const deployedContracts: {
  [networkId: number]: { [key in DeployedContracts]: string };
} = {
  // hardhat
  31337: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  42: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x99FCf805C468977e0F8Ceae21935268EEceadC07",
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
