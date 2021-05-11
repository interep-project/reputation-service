import hre from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Badge, BadgeMock } from "typechain";

const { ethers } = hre;

const badgeName = "MyBadge";
const badgeSymbol = "BDGE";

const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("Badge", () => {
  let signer0: SignerWithAddress;

  before(async function () {
    [signer0] = await hre.ethers.getSigners();
  });

  let badge: Badge;
  beforeEach(async function () {
    const BadgeFactory = await ethers.getContractFactory("Badge");
    badge = await BadgeFactory.connect(signer0).deploy(badgeName, badgeSymbol);
  });

  it("should return the badge name", async () => {
    expect(await badge.name()).to.equal(badgeName);
  });

  it("should return the badge symbol", async () => {
    expect(await badge.symbol()).to.equal(badgeSymbol);
  });
});

describe("BadgeMock", () => {
  let signer0: SignerWithAddress;
  let signer1: SignerWithAddress;
  let badgeMock: BadgeMock;

  before(async function () {
    [signer0, signer1] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const BadgeMockFactory = await ethers.getContractFactory("BadgeMock");
    badgeMock = await BadgeMockFactory.deploy(badgeName, badgeSymbol);
  });

  describe("mint", () => {
    it("should not allow minting to the zero address", async () => {
      await expect(badgeMock.mint(zeroAddress, 123)).to.be.revertedWith(
        "Invalid owner at zero address"
      );
    });

    it("should not allow minting with an id of zero", async () => {
      await expect(badgeMock.mint(signer0.address, 0)).to.be.revertedWith(
        " Token ID cannot be zero"
      );
    });

    it("should not allow minting with a token id that already exists", async () => {
      const tokenId = 1;
      const mintTx = await badgeMock.mint(signer0.address, tokenId);
      await mintTx.wait();

      await expect(badgeMock.mint(signer1.address, tokenId)).to.be.revertedWith(
        "Token already minted"
      );
    });

    it("should mint and emit an event", async () => {
      const tokenId = 1;
      const owner = signer1.address;
      // const block = await ethers.provider.getBlock("latest");

      await expect(badgeMock.mint(owner, tokenId))
        .to.emit(badgeMock, "Minted")
        .withArgs(
          owner,
          tokenId,
          // Not sure about this one
          (await ethers.provider.getBlock("latest")).timestamp + 1
        );
    });
  });

  describe("tokenOf", () => {
    it("should revert for the zero address", async () => {
      await expect(badgeMock.tokenOf(zeroAddress)).to.be.revertedWith(
        "Invalid owner at zero address"
      );
    });

    it("should return 0 if the owner does not have a token", async () => {
      expect(await badgeMock.tokenOf(signer0.address)).to.equal(0);
    });

    it("should return the id of the token owned by owner", async () => {
      const tokenId = 42;
      const mintTx = await badgeMock.mint(signer1.address, tokenId);
      await mintTx.wait();

      expect(await badgeMock.tokenOf(signer1.address)).to.equal(tokenId);
    });
  });

  describe("ownerOf", () => {
    it("should revert if tokenId equals 0", async () => {
      await expect(badgeMock.ownerOf(0)).to.be.revertedWith(
        "Invalid tokenId value"
      );
    });

    it("should revert if the token does not exist", async () => {
      await expect(badgeMock.ownerOf(12345)).to.be.revertedWith(
        "Invalid owner at zero address"
      );
    });

    it("should return the owner of the token", async () => {
      const tokenId = 8;
      const mintTx = await badgeMock.mint(signer1.address, tokenId);
      await mintTx.wait();

      expect(await badgeMock.ownerOf(tokenId)).to.equal(signer1.address);
    });
  });
});
