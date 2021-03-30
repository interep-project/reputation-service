import { normalizeBotometerData } from "./botometer";

const getRandomBotometerScores = () => ({
  astroturf: Math.random(),
  fake_follower: Math.random(),
  financial: Math.random(),
  other: Math.random(),
  overall: Math.random(),
  self_declared: Math.random(),
  spammer: Math.random(),
});

describe("normalizeBotometerData", () => {
  it("should return well formatted data", () => {
    const mockBotometerData = {
      cap: { english: 0.8, universal: 0.8 },
      raw_scores: {
        english: getRandomBotometerScores(),
        universal: getRandomBotometerScores(),
      },
      display_scores: {
        english: getRandomBotometerScores(),
        universal: getRandomBotometerScores(),
      },
      twitterData: {
        user: {
          id: 1234,
          followers_count: 1200,
          friends_count: 450,
          created_at: "Tue Mar 21 20:50:14 +0000 2006",
        },
      },
    };

    const normalizedData = normalizeBotometerData(mockBotometerData);

    expect(normalizedData).toEqual({
      twitterData: mockBotometerData.twitterData.user,
      botometer: {
        raw_scores: mockBotometerData.raw_scores,
        display_scores: mockBotometerData.display_scores,
        cap: mockBotometerData.cap,
      },
    });
  });

  it("should still return botometer scores without user data", () => {
    const mockBotometerData = {
      cap: { english: 0.8, universal: 0.8 },
      raw_scores: {
        english: getRandomBotometerScores(),
        universal: getRandomBotometerScores(),
      },
      display_scores: {
        english: getRandomBotometerScores(),
        universal: getRandomBotometerScores(),
      },
    };

    const normalizedData = normalizeBotometerData(mockBotometerData);

    expect(normalizedData).toEqual({
      botometer: {
        raw_scores: mockBotometerData.raw_scores,
        display_scores: mockBotometerData.display_scores,
        cap: mockBotometerData.cap,
      },
    });
  });

  it("should handle an empty object", () => {
    // @ts-expect-error
    const normalizedData = normalizeBotometerData({});

    expect(normalizedData).toEqual({});
  });
});
