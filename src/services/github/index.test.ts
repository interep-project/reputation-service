import { getReputationParamsByToken } from "./index"

describe("github service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(JSON.stringify({ login: "r1oga" }))

        const { stars, sponsoringCount, sponsorsCount } = await getReputationParamsByToken("token")

        expect(stars).toBeDefined().toBeGreaterThan(0)
        expect(typeof sponsoringCount).toBe("number")
        expect(typeof sponsorsCount).toBe("number")
    })
})
