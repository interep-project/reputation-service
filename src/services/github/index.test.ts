import { getGithubUserByToken } from "./index"

describe("github service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(JSON.stringify({ id: 123, login: "r1oga" }))

        const {
            id,
            reputationParams: { receivedStars, sponsoringCount, sponsorsCount }
        } = await getGithubUserByToken("token")

        expect(id).toEqual("123")
        expect(receivedStars).toBeDefined().toBeGreaterThan(0)
        expect(typeof sponsoringCount).toBe("number")
        expect(typeof sponsorsCount).toBe("number")
    })
})
