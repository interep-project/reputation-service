import { getPoapEventsByAddress, getPoapEventFancyId, getPoapEvent, getPoapEvents, PoapEvent } from "."

jest.mock("src/services/poap", () => ({
    __esModule: true,
    getPoapTokens: jest.fn(() => [{ event: { fancy_id: "devcon3" } }])
}))

describe("# core/poap", () => {
    describe("# getPoapEvent", () => {
        it("Should return a POAP event name", () => {
            const expectedValue = getPoapEvent(PoapEvent.DEVCON_3)

            expect(expectedValue).toBe("Devcon 3")
        })
    })

    describe("# getPoapEvents", () => {
        it("Should return all the POAP events", () => {
            const expectedValue = getPoapEvents()

            expect(expectedValue).toHaveLength(3)
        })
    })

    describe("# getPoapEventFancyId", () => {
        it("Should return an event fancy id", () => {
            const expectedValue = getPoapEventFancyId(PoapEvent.DEVCON_3)

            expect(expectedValue).toBe("devcon3")
        })
    })

    describe("# getPoapEventsByAddress", () => {
        it("Should return an event fancy id", async () => {
            const expectedValue = await getPoapEventsByAddress("address")

            expect(expectedValue).toEqual([PoapEvent.DEVCON_3])
        })
    })
})
