import { ethers } from "hardhat";

async function main() {
  const [backend, deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const badgeFactoryFactory = await ethers.getContractFactory("BadgeFactory");
  const badgeFactory = await badgeFactoryFactory.deploy(backend.address);

  console.log("badgeFactory address:", badgeFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export {};
