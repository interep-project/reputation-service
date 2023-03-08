import { getRedditUserByToken } from "./index"

describe("reddit service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(
            JSON.stringify({
                id: "123",
                has_gold_subscription: true,
                has_subscribed_to_premium: true,
                total_karma: 100
            })
        )

        const {
            id,
            reputationParams: { isGold, totalKarma }
        } = await getRedditUserByToken("fooUser")

        expect(id).toEqual("123")
        expect(isGold).toEqual(true)
        expect(totalKarma).toEqual(100)
    })
})
