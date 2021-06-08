import { ethers } from "hardhat";

export const getTokenIdHash = (str: string) => ethers.utils.id(str);

export const getDecimalTokenId = (str: string) =>
  ethers.BigNumber.from(getTokenIdHash(str));
