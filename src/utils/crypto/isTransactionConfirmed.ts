import { ethers } from "hardhat";

export const isTransactionConfirmed = async (
  txHash: string
): Promise<boolean> => {
  const receipt = await ethers.provider.getTransactionReceipt(txHash);

  if (!receipt || receipt.confirmations < 3) return false;

  return true;
};
