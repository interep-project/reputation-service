import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { expect } from "chai";
import { Contract, ContractFactory } from "@ethersproject/contracts";

const { ethers, upgrades } = hre;

describe("ReputationBadge", function () {
  let badge: Contract;
  let deployer: SignerWithAddress;
  let backend: SignerWithAddress;
  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;

  const badgeName = "TwitterBadge";
  const badgeSymbol = "iTWITT";

  before(async function () {
    [deployer, backend, signer1, signer2] = await hre.ethers.getSigners();
  });

  beforeEach(async function () {
    const BadgeFactory: ContractFactory = await ethers.getContractFactory(
      "ReputationBadge"
    );

    badge = await upgrades.deployProxy(BadgeFactory, [
      badgeName,
      badgeSymbol,
      backend.address,
    ]);

    await badge.deployed();
  });

  it("should return the badge name", async () => {
    expect(await badge.name()).to.eq(badgeName);
  });

  it("should return the badge symbol", async () => {
    expect(await badge.symbol()).to.eq(badgeSymbol);
  });

  it("should return the owner of the contract", async () => {
    expect(await badge.owner()).to.eq(deployer.address);
  });

  it("should be able to transfer ownership from deployer", async () => {
    expect(await badge.owner()).to.eq(deployer.address);

    const transferTx = await badge
      .connect(deployer)
      .transferOwnership(signer1.address);
    await transferTx.wait();

    expect(await badge.owner()).to.eq(signer1.address);
  });

  /*
   **** PAUSING ****
   */
  it("should let the deployer pause", async () => {
    await badge.connect(deployer).pause();

    expect(await badge.paused()).to.be.true;
  });

  it("should let the deployer unpause", async () => {
    await badge.connect(deployer).pause();

    await badge.connect(deployer).unpause();

    expect(await badge.paused()).to.be.false;
  });

  it("should not let another signer pause", async () => {
    await expect(badge.connect(signer1).pause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("should not let another signer unpause", async () => {
    await expect(badge.connect(signer1).unpause()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  /*
   **** MINTING ****
   */
  it("should let the backend mint a token", async () => {
    await badge.connect(backend).safeMint(signer1.address, 1);

    expect(await badge.balanceOf(signer1.address)).to.eq(1);
    expect(await badge.ownerOf(1)).to.eq(signer1.address);
  });

  it("should only let the backend mint a token", async () => {
    await expect(
      badge.connect(signer1).safeMint(signer1.address, 234)
    ).to.be.revertedWith("Unauthorized");
  });

  it("should not let mint twice with the same id", async () => {
    const tokenId = 5555;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    expect(await badge.balanceOf(signer1.address)).to.eq(1);

    await expect(
      badge.connect(backend).safeMint(signer2.address, tokenId)
    ).to.be.revertedWith("ERC721: token already minted");
  });

  it("should batch mint several tokens", async () => {
    expect(await badge.balanceOf(signer1.address)).to.eq(0);
    expect(await badge.balanceOf(signer2.address)).to.eq(0);

    const batchMintTx = await badge.connect(backend).batchMint([
      { to: signer1.address, tokenId: 34 },
      { to: signer2.address, tokenId: 45 },
    ]);
    await batchMintTx.wait();

    expect(await badge.ownerOf(34)).to.eq(signer1.address);
    expect(await badge.ownerOf(45)).to.eq(signer2.address);
  });

  it("should restrict batch minting to the backend", async () => {
    await expect(
      badge.connect(signer2).batchMint([
        { to: signer1.address, tokenId: 10 },
        { to: signer2.address, tokenId: 11 },
      ])
    ).to.be.revertedWith("Unauthorized");
  });

  it("should return true if a token exists", async () => {
    await badge.connect(backend).safeMint(signer1.address, 1);

    expect(await badge.exists(1)).to.be.true;
  });

  it("should return false if a token does not exist", async () => {
    expect(await badge.exists(268080990909099)).to.be.false;
  });

  /*
   **** BACKEND ADDRESS ****
   */
  it("should return the backend address", async () => {
    expect(await badge.backendAddress()).to.eq(backend.address);
  });

  it("should let the deployer change the backend address", async () => {
    const newBackend = signer1;

    await expect(
      badge.connect(newBackend).safeMint(signer1.address, 234)
    ).to.be.revertedWith("Unauthorized");

    // check balance is 0
    expect(await badge.balanceOf(signer1.address)).to.eq(0);

    // change backend address
    const tx = await badge
      .connect(deployer)
      .changeBackendAddress(signer1.address);
    await tx.wait();

    // check backendAddress was changed
    expect(await badge.backendAddress()).to.eq(signer1.address);

    // try minting again
    await badge.connect(signer1).safeMint(signer1.address, 234);

    // check balance is 1
    expect(await badge.balanceOf(signer1.address)).to.eq(1);
  });

  it("should only let the deployer change the backend address", async () => {
    await expect(
      badge.connect(signer1).changeBackendAddress(signer1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  /*
   **** BURNING ****
   */
  it("should let tokens be burned by their owner", async () => {
    const tokenId = 5645324387978;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    expect(await badge.balanceOf(signer1.address)).to.eq(1);

    await badge.connect(signer1).burn(tokenId);

    expect(await badge.balanceOf(signer1.address)).to.eq(0);
  });

  it("should let approved accounts burn tokens on behalf", async () => {
    const tokenId = 44;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    expect(await badge.balanceOf(signer1.address)).to.eq(1);

    await badge.connect(signer1).approve(signer2.address, tokenId);

    await expect(badge.connect(signer2).burn(tokenId)).to.not.be.reverted;
    expect(await badge.balanceOf(signer1.address)).to.eq(0);
  });

  it("should not let tokens be burned if not approved or owner", async () => {
    const tokenId = 3333;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    expect(await badge.balanceOf(signer1.address)).to.eq(1);

    await expect(badge.connect(signer2).burn(tokenId)).to.be.revertedWith(
      "ERC721Burnable: caller is not owner nor approved"
    );
    expect(await badge.balanceOf(signer1.address)).to.eq(1);
  });

  /*
   **** URI ****
   */
  it("should set the base URI", async () => {
    const baseURI = "https://interrep.link/tokens/";
    const tokenId = 1;

    await badge.connect(deployer).changeBaseURI(baseURI);

    await badge.connect(backend).safeMint(signer1.address, tokenId);

    expect(await badge.tokenURI(1)).to.eq(baseURI + tokenId.toString());
  });

  it("should only let the deployer change the base URI", async () => {
    await expect(
      badge.connect(signer1).changeBaseURI("https://opensea.io/")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  /*
   **** TRANSFER ****
   */
  it("should let token holders transfer their token", async () => {
    const tokenId = 6;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    await expect(() =>
      badge.connect(signer1)[
        // eslint-disable-next-line no-unexpected-multiline
        "safeTransferFrom(address,address,uint256)"
      ](signer1.address, signer2.address, tokenId)
    ).to.changeTokenBalances(badge, [signer1, signer2], [-1, 1]);
  });

  it("should let approved accounts transfer a token", async () => {
    const tokenId = 77;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    await badge.connect(signer1).approve(signer2.address, tokenId);

    await badge.connect(signer2)[
      // eslint-disable-next-line no-unexpected-multiline
      "safeTransferFrom(address,address,uint256)"
    ](signer1.address, deployer.address, tokenId);

    expect(await badge.ownerOf(tokenId)).to.eq(deployer.address);
  });

  it("should not let unapproved transfers happen", async () => {
    const tokenId = 8;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    await expect(
      badge.connect(signer2)[
        // eslint-disable-next-line no-unexpected-multiline
        "safeTransferFrom(address,address,uint256)"
      ](signer1.address, signer2.address, tokenId)
    ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });

  it("should not let transfer happen when paused", async () => {
    const tokenId = 991;
    await badge.connect(backend).safeMint(signer1.address, tokenId);

    await badge.connect(deployer).pause();

    await expect(
      badge.connect(signer1)[
        // eslint-disable-next-line no-unexpected-multiline
        "safeTransferFrom(address,address,uint256)"
      ](signer1.address, signer2.address, tokenId)
    ).to.be.revertedWith("Pausable: paused");
  });
});
