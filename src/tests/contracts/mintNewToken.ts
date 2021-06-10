import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";
import mintNewToken from "src/core/blockchain/ReputationBadge/mintNewToken";
import { ContractFactory } from "ethers";

const { ethers, upgrades } = hre;

describe("mintNewToken", () => {
  let backend: SignerWithAddress;
  let tokenHolder: SignerWithAddress;
  let reputationBadge: ReputationBadge;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "TWITT";

  before(async function () {
    [backend, tokenHolder] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const BadgeFactory: ContractFactory = await ethers.getContractFactory(
      "ReputationBadge"
    );

    reputationBadge = (await upgrades.deployProxy(BadgeFactory, [
      badgeName,
      badgeSymbol,
      backend.address,
    ])) as ReputationBadge;
  });

  it("should mint successfully", async () => {
    const tokenRecipientAddress = tokenHolder.address;
    const tokenId = "185030932498643032395873032093248040430932832";

    expect(await reputationBadge.balanceOf(tokenRecipientAddress)).to.eq(0);

    await mintNewToken({
      badgeAddress: reputationBadge.address,
      tokenId,
      to: tokenRecipientAddress,
    });

    expect(await reputationBadge.balanceOf(tokenRecipientAddress)).to.eq(1);
  });
});
