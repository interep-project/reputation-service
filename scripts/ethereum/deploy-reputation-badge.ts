import { ethers, upgrades } from "hardhat";

const NEW_BADGE_NAME = "InterRep Twitter Badge";
const NEW_BADGE_SYMBOL = "iTWITT";

async function main() {
  const [backend] = await ethers.getSigners();
  const networkName = (await ethers.provider.getNetwork()).name;

  console.log(`Network: `, networkName);
  console.log("Deploying badge with the account: ", backend.address);

  console.log("Account balance:", (await backend.getBalance()).toString());

  const ReputationBadgeFactory = await ethers.getContractFactory(
    "ReputationBadge"
  );

  // Unfortunately the first signer is used to deploy and there is no option to change that
  // See https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/271
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
