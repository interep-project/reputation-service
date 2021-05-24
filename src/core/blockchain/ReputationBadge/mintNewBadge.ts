import { ContractTransaction } from "@ethersproject/contracts";
import { ethers } from "hardhat";
import { ReputationBadge } from "typechain";

type MintNewBadgeProps = {
  badgeAddress: string;
  to: string;
  tokenId: string;
};

const mintNewBadge = async ({
  badgeAddress,
  to,
  tokenId,
}: MintNewBadgeProps): Promise<ContractTransaction> => {
  if (!tokenId) throw new Error("Token id is not defined");

  const [backend] = await ethers.getSigners();

  const reputationBadge = (await ethers.getContractAt(
    "ReputationBadge",
    badgeAddress
  )) as ReputationBadge;

  const mintTx: ContractTransaction = await reputationBadge
    .connect(backend)
    .mint(to, tokenId);

  return mintTx;
};

export default mintNewBadge;
