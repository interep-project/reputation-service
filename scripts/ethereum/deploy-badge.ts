import { ethers } from "hardhat";
import { BadgeFactory } from "typechain";

const badgeFactoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const NEW_BADGE_NAME = "TwitterBadge";
const NEW_BADGE_SYMBOL = "iTWITT";

async function main() {
  const [, deployer] = await ethers.getSigners();

  console.log("Deploying badge with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const badgeFactory = (await ethers.getContractAt(
    "BadgeFactory",
    badgeFactoryAddress
  )) as BadgeFactory;
  const deployBadgeTx = await badgeFactory.deployBadge(
    NEW_BADGE_NAME,
    NEW_BADGE_SYMBOL
  );
  const txReceipt = await deployBadgeTx.wait();

  console.log("Transaction complete");
  console.log("Transaction Receipt: ", JSON.stringify(txReceipt));
  console.log(`New Badge deployed`, txReceipt.events?.[0].args);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
