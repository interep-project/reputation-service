import { ethers } from "hardhat";
import mintNewToken from "src/core/blockchain/ReputationBadge/mintNewToken";

async function main() {
  const tokenId = ethers.utils.id("12344");

  const txHash = await mintNewToken({
    badgeAddress: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
    to: "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
    tokenId,
  });

  if (txHash) {
    console.log(`txHash`, txHash);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
