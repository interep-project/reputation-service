import { getRedditReputationParams } from "./index"

describe("reddit service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(
            JSON.stringify({ has_gold_subscription: true, has_subscribed_to_premium: true, total_karma: 100 })
        )

        const { isGold, totalKarma } = await getRedditReputationParams("fooUser")

        expect(isGold).toEqual(true)
        expect(totalKarma).toEqual(100)
    })
})
