import { OAuthProvider, ReputationLevel } from "@interep/reputation"
import { Botometer } from "botometer"
import { calculateReputation } from "./index"

describe("Reputation Service", () => {
    it("should be able to get the reputation of a github user", async () => {
        fetchMock.mockOnce(JSON.stringify({ id: 123, login: "r1oga" }))

        const { id, reputation } = await calculateReputation({
            provider: OAuthProvider.GITHUB,
            token: "token"
        })

        expect(id).toEqual("123")
        expect(Object.values(ReputationLevel)).toContain(reputation)
    })

    it("should be able to get the reputation of a reddit user", async () => {
        fetchMock.mockOnce(
            JSON.stringify({
                id: "123",
                has_gold_subscription: true,
                has_subscribed_to_premium: true,
                total_karma: 100
            })
        )
        const { id, reputation } = await calculateReputation({
            provider: OAuthProvider.REDDIT,
            token: "token"
        })

        expect(id).toEqual("123")
        expect(Object.values(ReputationLevel)).toContain(reputation)
    })

    it("should be able to get the reputation of a twitter user", async () => {
        fetchMock.mockOnce(
            JSON.stringify({ id_str: "123", followers_count: 100, verified: false, screen_name: "r1oga" })
        )
        jest.spyOn(Botometer.prototype, "getScore").mockResolvedValueOnce({ cap: { universal: 0.5 } })

        const { id, reputation } = await calculateReputation({
            provider: OAuthProvider.TWITTER,
            token: "token"
        })

        expect(id).toEqual("123")
        expect(Object.values(ReputationLevel)).toContain(reputation)
    })
})
