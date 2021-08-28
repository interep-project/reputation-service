import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { getDefaultNetworkId } from "./getDefaultNetwork";

export enum DeployedContracts {
  TWITTER_BADGE = "TWITTER_BADGE",
  INTERREP_GROUPS = "INTERREP_GROUPS",
}

const deployedContracts: {
  [networkId: number]: { [key in DeployedContracts]: string };
} = {
  // hardhat
  31337: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    [DeployedContracts.INTERREP_GROUPS]:
      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  3: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
    [DeployedContracts.INTERREP_GROUPS]:
      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  42: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x99FCf805C468977e0F8Ceae21935268EEceadC07",
    [DeployedContracts.INTERREP_GROUPS]:
      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  421611: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
    [DeployedContracts.INTERREP_GROUPS]:
      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  42161: {
    [DeployedContracts.TWITTER_BADGE]:
      "0x2F4d1333337b5C4C47Db5DB3A36eD547a549BC11",
    [DeployedContracts.INTERREP_GROUPS]:
      "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
};

export const isNetworkWithDeployedContract = (
  id?: number
): id is keyof typeof deployedContracts => !!id && id in deployedContracts;

export const getDeployedContractAddress = (
  contract: DeployedContracts
): string | null => {
  const networkId = getDefaultNetworkId();

  if (!isNetworkWithDeployedContract(networkId)) {
    return null;
  }

  return deployedContracts[networkId][contract];
};

export const getBadgeAddressByProvider = (
  web2Provider: Web2Providers
): string | null => {
  if (web2Provider == Web2Providers.TWITTER) {
    return getDeployedContractAddress(DeployedContracts.TWITTER_BADGE);
  } else {
    throw new Error("Unsupported provider");
  }
};

export default deployedContracts;
