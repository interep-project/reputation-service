import { ethers } from "hardhat";
import {
  DeployedContracts,
  getDeployedContractAddress,
} from "src/utils/crypto/deployedContracts";
import { ReputationBadge } from "typechain";

import ReputationBadgeArtifact from "artifacts/src/contracts/ReputationBadge.sol/ReputationBadge.json";
import { stringToBigNumber } from "src/utils/crypto/bigNumber";

const ReputationBadgeInterface = new ethers.utils.Interface(
  ReputationBadgeArtifact.abi
);

// TODO: Refactor this file
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

  const tokenIdBigNum = stringToBigNumber(tokenId);

  return instance.exists(tokenIdBigNum);
};

export const getBurnedEvent = async (
  owner?: string,
  tokenId?: string,
  contractAddress?: string
): Promise<any[]> => {
  const instance = await getInstance(contractAddress);
  let topics: (string | string[])[] | undefined;

  if (owner || tokenId) {
    topics = instance.filters.Burned(owner, tokenId).topics;
  }

  const logs = await ethers.provider.getLogs({
    address: contractAddress || instance.address,
    topics,
  });

  const decodedEvents = logs.map((log) => ({
    ...ReputationBadgeInterface.decodeEventLog("Burned", log.data, log.topics),
  }));

  return decodedEvents;
};

export default { getInstance, exists, getBurnedEvent };
