import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { TwitterBadge } from "typechain";

const { ethers } = hre;

describe("TwitterBadge", () => {
  let owner: SignerWithAddress;
  let backend: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;
  let twitterBadge: TwitterBadge;

  before(async function () {
    [owner, backend, signer2, signer3] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const TwitterBadgeFactory = await ethers.getContractFactory("TwitterBadge");
    twitterBadge = await TwitterBadgeFactory.connect(owner).deploy(
      backend.address
    );
  });

  describe("constructor", () => {
    it("should have the right name", async () => {
      expect(await twitterBadge.name()).to.eq("TwitterBadge");
    });

    it("should have the right symbol", async () => {
      expect(await twitterBadge.symbol()).to.eq("TWITT");
    });

    it("should have the right owner", async () => {
      expect(await twitterBadge.owner()).to.eq(owner.address);
    });
  });

  describe("minting", () => {
    it("should restrict minting to the backend address", async () => {
      await expect(
        twitterBadge.connect(signer2).mint(signer2.address, 1)
      ).to.be.revertedWith("Unauthorized");
    });

    it("should mint successfully", async () => {
      const tokenRecipient = signer2.address;
      const tokenId = 42;

      const mintTx = await twitterBadge
        .connect(backend)
        .mint(tokenRecipient, tokenId);
      await mintTx.wait();

      expect(await twitterBadge.tokenOf(tokenRecipient)).to.eq(tokenId);
    });
  });

  describe("burning", () => {
    let tokenOwner: SignerWithAddress;
    const tokenId = 11;
    beforeEach(async () => {
      tokenOwner = signer3;

      // mint token with `tokenId` to `tokenOwner` before each test
      const mintTx = await twitterBadge
        .connect(backend)
        .mint(tokenOwner.address, tokenId);
      await mintTx.wait();

      expect(await twitterBadge.tokenOf(tokenOwner.address)).to.eq(tokenId);
    });

    it("should not let anyone burn", async () => {
      await expect(
        twitterBadge.connect(owner).burn(tokenId)
      ).to.be.revertedWith("Unauthorized");
    });

    it("should let the backend burn a token", async () => {
      const burnTx = await twitterBadge.connect(backend).burn(tokenId);
      await burnTx.wait();

      expect(await twitterBadge.tokenOf(tokenOwner.address)).to.eq(0);
    });

    it("should let owners burn their token", async () => {
      const burnTx = await twitterBadge.connect(tokenOwner).burn(tokenId);
      await burnTx.wait();

      expect(await twitterBadge.tokenOf(tokenOwner.address)).to.eq(0);
    });
  });
});
