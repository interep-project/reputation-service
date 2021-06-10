import { ethers, upgrades } from "hardhat";

const NEW_BADGE_NAME = "TwitterBadge";
const NEW_BADGE_SYMBOL = "iTWITT";

async function main() {
  const [backend, deployer] = await ethers.getSigners();
  const networkName = (await ethers.provider.getNetwork()).name;

  console.log(`Network: `, networkName);
  console.log("Deploying badge with the account: ", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ReputationBadgeFactory = await ethers.getContractFactory(
    "ReputationBadge"
  );
  const reputationBadge = await upgrades.deployProxy(ReputationBadgeFactory, [
    NEW_BADGE_NAME,
    NEW_BADGE_SYMBOL,
    backend.address,
  ]);
  await reputationBadge.deployed();
  console.log("New ReputationBadge deployed to:", reputationBadge.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
