import { ContractTransaction } from "@ethersproject/contracts";
import { ethers } from "hardhat";
import { stringToBigNumber } from "src/utils/crypto/bigNumber";

type MintNewTokenProps = {
  badgeAddress: string;
  to: string;
  tokenId: string;
};

const mintNewToken = async ({
  badgeAddress,
  to,
  tokenId,
}: MintNewTokenProps): Promise<ContractTransaction> => {
  if (!tokenId) throw new Error("Token id is not defined");

  const decimalId = stringToBigNumber(tokenId);

  const [backend] = await ethers.getSigners();

  const reputationBadge = await ethers.getContractAt(
    "ReputationBadge",
    badgeAddress
  );

  const mintTx: ContractTransaction = await reputationBadge
    .connect(backend)
    .safeMint(to, decimalId);

  return mintTx;
};

export default mintNewToken;
