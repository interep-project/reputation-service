import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";

const { ethers } = hre;

describe("ReputationBadge", () => {
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;
  let reputationBadge: ReputationBadge;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "TWITT";

  before(async function () {
    [owner, backend, signer2, signer3] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const ReputationBadgeFactory = await ethers.getContractFactory(
      "ReputationBadge"
    );
    reputationBadge = await ReputationBadgeFactory.connect(owner).deploy(
      badgeName,
      badgeSymbol,
      backend.address
    );
  });

  describe("constructor", () => {
    it("should have the right name", async () => {
      expect(await reputationBadge.name()).to.eq(badgeName);
    });

    it("should have the right symbol", async () => {
      expect(await reputationBadge.symbol()).to.eq(badgeSymbol);
    });

    it("should have the right owner", async () => {
      expect(await reputationBadge.owner()).to.eq(owner.address);
    });
  });

  describe("minting", () => {
    it("should restrict minting to the backend address", async () => {
      await expect(
        reputationBadge.connect(signer2).mint(signer2.address, 1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("should mint successfully", async () => {
      const tokenRecipient = signer2.address;
      const tokenId = 42;

      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenRecipient, tokenId);
      await mintTx.wait();

      expect(await reputationBadge.tokenOf(tokenRecipient)).to.eq(tokenId);
    });
  });

  describe("burning", () => {
    let tokenOwner: SignerWithAddress;
    const tokenId = 11;
    beforeEach(async () => {
      tokenOwner = signer3;

      // mint token with `tokenId` to `tokenOwner` before each test
      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenOwner.address, tokenId);
      await mintTx.wait();

      expect(await reputationBadge.tokenOf(tokenOwner.address)).to.eq(tokenId);
    });

    it("should not let anyone burn", async () => {
      await expect(
        reputationBadge.connect(owner).burn(tokenId)
      ).to.be.revertedWith("Unauthorized");
    });

    it("should let the backend burn a token", async () => {
      const burnTx = await reputationBadge.connect(backend).burn(tokenId);
      await burnTx.wait();

      expect(await reputationBadge.tokenOf(tokenOwner.address)).to.eq(0);
    });

    it("should let owners burn their token", async () => {
      const burnTx = await reputationBadge.connect(tokenOwner).burn(tokenId);
      await burnTx.wait();

      expect(await reputationBadge.tokenOf(tokenOwner.address)).to.eq(0);
    });
  });
});
