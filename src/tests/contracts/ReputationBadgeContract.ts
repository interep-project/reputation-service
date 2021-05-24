import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";
import { getTokenIdHash } from "../utils/getTokenIdHash";
import TwitterBadgeContract from "src/core/blockchain/ReputationBadge/TwitterBadgeContract";

const { ethers } = hre;

describe("ReputationBadgeContract", () => {
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let tokenOwner: SignerWithAddress;
  let reputationBadge: ReputationBadge;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "TWITT";

  before(async function () {
    [owner, backend, tokenOwner] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const BadgeFactoryFactory = await ethers.getContractFactory("BadgeFactory");
    const badgeFactory = await BadgeFactoryFactory.deploy(backend.address);

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

  describe("getBurnedEvent", () => {
    const tokenId = getTokenIdHash("42");
    beforeEach(async () => {
      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenOwner.address, tokenId);
      await mintTx.wait();

      const burnTx = await reputationBadge.connect(backend).burn(tokenId);
      await burnTx.wait();
    });

    it("should return events by token id", async () => {
      const events = await TwitterBadgeContract.getBurnedEvent(
        undefined,
        tokenId,
        reputationBadge.address
      );

      expect(events[0].tokenId).to.eq(tokenId);
      expect(events[0].owner).to.eq(tokenOwner.address);
    });

    it("should return events by owner", async () => {
      const events = await TwitterBadgeContract.getBurnedEvent(
        tokenOwner.address,
        undefined,
        reputationBadge.address
      );

      expect(events[0].tokenId).to.eq(tokenId);
      expect(events[0].owner).to.eq(tokenOwner.address);
    });

    it("should return an empty array if no event is found", async () => {
      const events = await TwitterBadgeContract.getBurnedEvent(
        backend.address,
        undefined,
        reputationBadge.address
      );

      expect(events).to.be.instanceOf(Array);
      expect(events.length).to.eq(0);
    });
  });
});
