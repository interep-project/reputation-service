import mintNewToken from "./mintNewToken"

jest.mock("hardhat", () => ({
    ethers: {
        getContractAt: () => ({
            safeMint: jest.fn(() => "mintTxResponse")
        }),
        getSigners: () => [{ signer: "1" }],
        BigNumber: { from: jest.fn(() => 12334556) }
    }
}))

describe("mintNewToken", () => {
    it("Should throw if no token id was passed", async () => {
        // @ts-expect-error: tokenId should be defined
        const fun = () => mintNewToken({ tokenId: undefined })

        await expect(fun).rejects.toThrow("Token id is not defined")
    })

    it("Should return the transaction response", async () => {
        const to = "to"
        const tokenId = "12234"
        const txResponse = await mintNewToken({
            badgeAddress: "badgeAddy",
            to,
            tokenId
        })

        expect(txResponse).toEqual("mintTxResponse")
    })
})
