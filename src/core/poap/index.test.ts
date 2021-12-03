import getPoapEvents from "./getPoapEvents"
import getPoapEventsByAddress from "./getPoapEventsByAddress"
import PoapEvent from "./poapEvent"

jest.mock("src/services/poap", () => ({
    __esModule: true,
    getPoapTokens: jest.fn(() => [{ event: { fancy_id: "devcon3" } }])
}))

describe("# core/poap", () => {
    describe("# getPoapEvents", () => {
        it("Should return all the POAP events", () => {
            const expectedValue = getPoapEvents()

            expect(expectedValue).toHaveLength(3)
        })
    })

    describe("# getPoapEventsByAddress", () => {
        it("Should return an event fancy id", async () => {
            const expectedValue = await getPoapEventsByAddress("address")

            expect(expectedValue).toEqual([PoapEvent.DEVCON_3])
        })
    })
})
