import { Botometer } from "botometer"
import { getTwitterUserByToken } from "./index"

describe("twitter service", () => {
    it("should return the required parameters to calculate the reputation score", async () => {
        fetchMock.mockOnce(
            JSON.stringify({ id_str: "123", followers_count: 100, verified: false, screen_name: "r1oga" })
        )
        jest.spyOn(Botometer.prototype, "getScore").mockResolvedValueOnce({ cap: { universal: 0.5 } })

        const {
            id,
            reputationParams: { followers, verifiedProfile, botometerOverallScore }
        } = await getTwitterUserByToken("token")

        expect(id).toEqual("123")
        expect(followers).toEqual(100)
        expect(verifiedProfile).toEqual(false)
        expect(botometerOverallScore).toEqual(0.5)
    })
})
