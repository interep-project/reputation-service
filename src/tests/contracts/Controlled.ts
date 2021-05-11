import { expect } from "chai";
import hre from "hardhat";
import { Controlled, ControlledMock } from "typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const { ethers } = hre;

describe("Controlled", function () {
  let deployer: SignerWithAddress;
  let backend: SignerWithAddress;
  let signer2: SignerWithAddress;

  before(async function () {
    [deployer, backend, signer2] = await hre.ethers.getSigners();
  });

  describe("Controlled", () => {
    it("Should have the address used to deploy as owner", async function () {
      const Controlled = await ethers.getContractFactory("Controlled");
      const controlled: Controlled = await Controlled.connect(deployer).deploy(
        backend.address
      );

      await controlled.deployed();

      expect(await controlled.owner()).to.equal(deployer.address);
    });
  });

  describe("Controlled child", () => {
    let mockControlled: ControlledMock;
    beforeEach(async function () {
      const ControlledMock = await ethers.getContractFactory("ControlledMock");
      mockControlled = await ControlledMock.connect(deployer).deploy(
        backend.address
      );
    });

    it("should restrict access to deployer with onlyOwner", async () => {
      expect(await mockControlled.connect(deployer).isOwner()).to.be.true;
    });

    it("should revert if not deployer with onlyOwner", async () => {
      await expect(
        mockControlled.connect(backend).isOwner()
      ).to.be.revertedWith("caller is not the owner");
    });

    it("should set a backend address", async () => {
      expect(
        await mockControlled.connect(deployer).getBackendAddress()
      ).to.equal(backend.address);
    });

    it("should allow the deployer to change the backend address", async () => {
      expect(
        await mockControlled.connect(deployer).getBackendAddress()
      ).to.equal(backend.address);

      const changeAddressTx = await mockControlled
        .connect(deployer)
        .setBackendAddress(signer2.address);
      changeAddressTx.wait();

      expect(
        await mockControlled.connect(deployer).getBackendAddress()
      ).to.equal(signer2.address);
    });

    it("should only allow the deployer to change the address", async () => {
      await expect(
        mockControlled.connect(signer2).setBackendAddress(signer2.address)
      ).to.be.revertedWith("caller is not the owner");
    });
  });
});
