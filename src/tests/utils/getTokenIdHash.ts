import { ethers } from "hardhat";

export const getTokenIdHash = (str: string) => ethers.utils.id(str);
