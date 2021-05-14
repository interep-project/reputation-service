import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";
import mintNewBadge from "../../core/blockchain/ReputationBadge/mintNewBadge";
import { getTokenIdHash } from "../utils/getTokenIdHash";

const { ethers } = hre;

describe("mintNewBadge", () => {
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let tokenHolder: SignerWithAddress;
  let reputationBadge: ReputationBadge;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "TWITT";

  before(async function () {
    [backend, owner, tokenHolder] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const BadgeFactoryFactory = await ethers.getContractFactory("BadgeFactory");
    const badgeFactory = await BadgeFactoryFactory.connect(owner).deploy(
      backend.address
    );

    const deployBadgeTx = await badgeFactory
      .connect(owner)
      .deployBadge(badgeName, badgeSymbol);
    const txReceipt = await deployBadgeTx.wait();

    const event = txReceipt.events?.[0];
    if (!event) throw new Error("No event emitted when deploying new badge");

    const newBadgeAddress = event?.args?.[1];

    reputationBadge = (await ethers.getContractAt(
      "ReputationBadge",
      newBadgeAddress
    )) as ReputationBadge;
  });

  it("should mint successfully", async () => {
    const tokenRecipientAddress = tokenHolder.address;
    const tokenId = getTokenIdHash("6087dabb0b3af8703a581bf0");

    await mintNewBadge({
      badgeAddress: reputationBadge.address,
      tokenId,
      to: tokenRecipientAddress,
    });

    expect(await reputationBadge.tokenOf(tokenRecipientAddress)).to.eq(tokenId);
  });
});
