import mintNewToken from "./mintNewToken"

jest.mock("src/utils/backend/getBackendContractInstance", () => ({
    __esModule: true,
    default: () => ({
        safeMint: jest.fn(() => "mintTxResponse")
    })
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
