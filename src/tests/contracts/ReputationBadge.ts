import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ReputationBadge } from "typechain";
import { getTokenIdHash } from "../utils/getTokenIdHash";

const { ethers } = hre;
const zeroX =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

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

  describe("constructor", () => {
    it("should have the right name", async () => {
      expect(await reputationBadge.name()).to.eq(badgeName);
    });

    it("should have the right symbol", async () => {
      expect(await reputationBadge.symbol()).to.eq(badgeSymbol);
    });
  });

  describe("exists", () => {
    it("should return true for an existing token", async () => {
      const tokenRecipient = signer2.address;
      const tokenId = getTokenIdHash("4242");

      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenRecipient, tokenId);
      await mintTx.wait();
      console.log(`txReceipt`, JSON.stringify(mintTx.chainId));
      // @ts-ignore: temp
      expect(await reputationBadge.exists(tokenId)).to.be.true;
    });

    it("should return false for a token that does not exist", async () => {
      const tokenRecipient = signer2.address;
      const tokenId = getTokenIdHash("4242");

      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenRecipient, tokenId);
      await mintTx.wait();

      const burnTx = await reputationBadge.connect(backend).burn(tokenId);
      await burnTx.wait();

      // @ts-ignore: temp
      expect(await reputationBadge.exists(tokenId)).to.be.false;
    });
  });

  describe("mint", () => {
    it("should restrict minting to the backend address", async () => {
      await expect(
        reputationBadge
          .connect(signer2)
          .mint(signer2.address, getTokenIdHash("1"))
      ).to.be.revertedWith("Unauthorized");
    });

    it("should mint successfully", async () => {
      const tokenRecipient = signer2.address;
      const tokenId = getTokenIdHash("42");

      const mintTx = await reputationBadge
        .connect(backend)
        .mint(tokenRecipient, tokenId);
      await mintTx.wait();

      expect(await reputationBadge.tokenOf(tokenRecipient)).to.eq(tokenId);
    });
  });

  describe("batchMint", () => {
    it("should restrict batch minting to the backend address", async () => {
      await expect(
        reputationBadge.connect(signer2).batchMint([
          { owner: signer2.address, tokenId: getTokenIdHash("1") },
          { owner: signer3.address, tokenId: getTokenIdHash("2") },
        ])
      ).to.be.revertedWith("Unauthorized");
    });

    it("should batch mint several tokens", async () => {
      expect(await reputationBadge.tokenOf(signer2.address)).to.eq(zeroX);
      expect(await reputationBadge.tokenOf(signer3.address)).to.eq(zeroX);

      const batchMintTx = await reputationBadge.connect(backend).batchMint([
        { owner: signer2.address, tokenId: getTokenIdHash("1") },
        { owner: signer3.address, tokenId: getTokenIdHash("2") },
      ]);
      await batchMintTx.wait();

      expect(await reputationBadge.tokenOf(signer2.address)).to.eq(
        getTokenIdHash("1")
      );
      expect(await reputationBadge.tokenOf(signer3.address)).to.eq(
        getTokenIdHash("2")
      );
    });
  });

  describe("burn", () => {
    let tokenOwner: SignerWithAddress;
    const tokenId = getTokenIdHash("11");
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

      expect(await reputationBadge.tokenOf(tokenOwner.address)).to.eq(zeroX);
    });

    it("should let owners burn their token", async () => {
      const burnTx = await reputationBadge.connect(tokenOwner).burn(tokenId);
      await burnTx.wait();

      expect(await reputationBadge.tokenOf(tokenOwner.address)).to.eq(zeroX);
    });
  });
});
