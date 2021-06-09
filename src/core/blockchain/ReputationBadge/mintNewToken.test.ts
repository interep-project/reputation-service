import mintNewToken from "./mintNewToken";

jest.mock("hardhat", () => ({
  ethers: {
    getContractAt: () => ({
      connect: () => ({ safeMint: jest.fn(() => "mintTxResponse") }),
    }),
    getSigners: () => [{ signer: "1" }],
    BigNumber: { from: jest.fn(() => 12334556) },
  },
}));

describe("mintNewToken", () => {
  it("should throw if no token id was passed", async () => {
    try {
      // @ts-expect-error: tokenId should be defined
      await mintNewToken({ tokenId: undefined });
    } catch (err) {
      expect(err).toEqual(new Error("Token id is not defined"));
    }
  });

  it("should return the transaction response", async () => {
    const to = "to";
    const tokenId = "12234";
    const txResponse = await mintNewToken({
      badgeAddress: "badgeAddy",
      to,
      tokenId,
    });

    expect(txResponse).toEqual("mintTxResponse");
  });
});
