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
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  42: {
    [DeployedContracts.BADGE_FACTORY]:
      "0xB9C4F6dC99f7CaC75F1a0dd18bc5A3fAc5a78466",
    [DeployedContracts.TWITTER_BADGE]:
      "0xb3e404E8BCbc2af1683da73f14A558662346119F",
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
