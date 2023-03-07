import { getGhReputationParams } from "./index"

describe("github service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(JSON.stringify({ login: "r1oga" }))

        const { receivedStars, sponsoringCount, sponsorsCount } = await getGhReputationParams("token")

        expect(receivedStars).toBeDefined().toBeGreaterThan(0)
        expect(typeof sponsoringCount).toBe("number")
        expect(typeof sponsorsCount).toBe("number")
    })
})
