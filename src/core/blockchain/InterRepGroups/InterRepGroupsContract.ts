import { ethers } from "hardhat";
import {
  DeployedContracts,
  getDeployedContractAddress,
} from "src/utils/crypto/deployedContracts";
import { InterRepGroups } from "contracts/typechain/InterRepGroups";

// TODO: Refactoring.
export async function getContractInstance(): Promise<InterRepGroups> {
  const address = getDeployedContractAddress(DeployedContracts.INTERREP_GROUPS);

  if (!address) {
    throw new Error(
      "Address not provided for instantiating InterRepGroups contract"
    );
  }

  return ((await ethers.getContractAt(
    "InterRepGroups",
    address
  )) as unknown) as InterRepGroups;
}
