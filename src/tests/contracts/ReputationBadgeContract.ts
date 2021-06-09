import hre, { upgrades } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";
import TwitterBadgeContract from "src/core/blockchain/ReputationBadge/TwitterBadgeContract";
import { ContractFactory } from "ethers";
import { zeroAddress } from "src/utils/crypto/constants";

const { ethers } = hre;

describe("ReputationBadgeContract", () => {
  let backend: SignerWithAddress;
  let tokenOwner: SignerWithAddress;
  let reputationBadge: ReputationBadge;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "TWITT";

  before(async function () {
    [backend, tokenOwner] = await hre.ethers.getSigners();
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

    await reputationBadge.deployed();
  });

  describe("getTransferEvent", () => {
    const tokenId = "134224823094823";
    beforeEach(async () => {
      const mintTx = await reputationBadge
        .connect(backend)
        .safeMint(tokenOwner.address, tokenId);
      await mintTx.wait();

      const burnTx = await reputationBadge.connect(tokenOwner).burn(tokenId);
      await burnTx.wait();
    });

    it("should return events by token id", async () => {
      const events = await TwitterBadgeContract.getTransferEvent(
        undefined,
        undefined,
        tokenId,
        reputationBadge.address
      );

      expect(events[0].tokenId).to.eq(tokenId);
      expect(events[0].from).to.eq(tokenOwner.address);
      expect(events[0].to).to.eq(zeroAddress);
    });

    it("should return transfer events by `from` address", async () => {
      const events = await TwitterBadgeContract.getTransferEvent(
        tokenOwner.address,
        undefined,
        undefined,
        reputationBadge.address
      );

      expect(events[0].tokenId).to.eq(tokenId);
      expect(events[0].from).to.eq(tokenOwner.address);
      expect(events[0].to).to.eq(zeroAddress);
    });

    it("should return an empty array if no event is found", async () => {
      const events = await TwitterBadgeContract.getTransferEvent(
        backend.address,
        undefined,
        reputationBadge.address
      );

      expect(events).to.be.instanceOf(Array);
      expect(events.length).to.eq(0);
    });
  });
});
