import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import {
  DeployedContracts,
  getDeployedContractAddress,
} from "src/utils/crypto/deployedContracts";
import { ReputationBadge } from "typechain";
import { TypedEventFilter } from "typechain/commons";

let instance: ReputationBadge;

export const getInstance = async (contractAddress?: string) => {
  if (instance) return instance;

  instance = (await ethers.getContractAt(
    "ReputationBadge",
    contractAddress ||
      getDeployedContractAddress(DeployedContracts.TWITTER_BADGE)
  )) as ReputationBadge;

  return instance;
};

export const exists = async (tokenId: string): Promise<boolean> => {
  const instance = await getInstance();
  return instance.exists(tokenId);
};

export const tokenOf = async (owner: string): Promise<string> => {
  const instance = await getInstance();
  return instance.tokenOf(owner);
};

export const getBurnedEvent = async (
  owner?: string,
  tokenId?: string,
  contractAddress?: string
): Promise<
  TypedEventFilter<
    [string, string, BigNumber],
    { owner: string; tokenId: string; timestamp: BigNumber }
  >
> => {
  const instance = await getInstance(contractAddress);

  return instance.filters.Burned(owner, tokenId);
};

export default { getInstance, exists, tokenOf, getBurnedEvent };
