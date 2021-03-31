import { createMocks, RequestMethod } from "node-mocks-http";
import User from "src/models/users/User.model";
import handler from "src/pages/api/twitter/[name]";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import { NextApiRequest, NextApiResponse } from "next";
import { RequestOptions } from "node:https";
import {
  mockBotometerData,
  mockBotometerScores,
} from "src/tests/mocks/botometerData";
import { getBotScore } from "src/services/botometer";

jest.mock("src/services/botometer", () => ({
  getBotScore: jest.fn(),
}));
const getBotScoreMocked = getBotScore as jest.MockedFunction<
  typeof getBotScore
>;

const createNextMocks = (
  reqOptions: (RequestOptions & { query: Record<string, string> }) | undefined
) =>
  createMocks<NextApiRequest, NextApiResponse>({
    // @ts-ignore
    method: "GET" as RequestMethod,
    ...reqOptions,
  });

describe("/twitter/[name]", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();
  });

  it("should return a 400 if a name is not provided", async () => {
    // Given
    const { req, res } = createNextMocks({
      query: {},
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(400);
  });

  it("should save a new user with name in lower case", async () => {
    // Given
    const twitterName = "JaCk";
    const { req, res } = createNextMocks({
      query: { name: twitterName },
    });

    // When
    await handler(req, res);

    const user = await User.findByTwitterName(twitterName.toLowerCase());

    // Expect
    expect(user?.twitter.name).toEqual(twitterName.toLowerCase());
  });

  it("should send botometer scores if already present", async () => {
    // Given
    const mockUser = {
      twitter: { name: "bob" },
      botometer: mockBotometerScores,
    };
    await new User(mockUser).save();

    // When
    const { req, res } = createNextMocks({
      query: { name: mockUser.twitter.name },
    });
    await handler(req, res);

    // Expect
    expect(res.statusCode).toBe(200);
    expect(res._getData().toObject()).toEqual(mockUser.botometer);
    expect(getBotScoreMocked).not.toHaveBeenCalled();
  });

  it("should query botometer and return botometer scores", async () => {
    // Given
    const handle = "StaniKulechov";
    getBotScoreMocked.mockImplementation(() =>
      Promise.resolve(mockBotometerData)
    );

    // When
    const { req, res } = createNextMocks({
      query: { name: handle },
    });
    await handler(req, res);

    // Expect
    expect(getBotScoreMocked).toHaveBeenCalledWith(handle.toLowerCase());
    expect(res._getData()).toEqual({
      raw_scores: {
        english: {
          astroturf: 0.26,
          fake_follower: 0.05,
          financial: 0,
          other: 0.27,
          overall: 0.09,
          self_declared: 0.01,
          spammer: 0,
        },
        universal: {
          astroturf: 0.19,
          fake_follower: 0.07,
          financial: 0,
          other: 0.23,
          overall: 0.4,
          self_declared: 0.01,
          spammer: 0,
        },
      },
      display_scores: {
        english: {
          astroturf: 1.3,
          fake_follower: 0.2,
          financial: 0,
          other: 1.4,
          overall: 0.4,
          self_declared: 0,
          spammer: 0,
        },
        universal: {
          astroturf: 1,
          fake_follower: 0.4,
          financial: 0,
          other: 1.2,
          overall: 2,
          self_declared: 0,
          spammer: 0,
        },
      },
      cap: { english: 0.4479465575931997, universal: 0.8030212452554465 },
    });
  });

  it("should query botometer and save the data", async () => {
    // Given
    const handle = "StaniKulechov";
    getBotScoreMocked.mockImplementation(() =>
      Promise.resolve(mockBotometerData)
    );

    // When
    const { req, res } = createNextMocks({
      query: { name: handle },
    });
    await handler(req, res);
    const user = await User.findByTwitterName(handle.toLowerCase());

    // Expect
    expect(getBotScoreMocked).toHaveBeenCalledWith(handle.toLowerCase());
    expect(user).toMatchObject({
      twitter: {
        name: "stanikulechov",
        id: 952921795316912100,
        followers_count: 48980,
        friends_count: 2574,
        created_at: "Mon Jan 15 15:13:55 +0000 2018",
      },
      botometer: {
        cap: { english: 0.4479465575931997, universal: 0.8030212452554465 },
        raw_scores: {
          english: expect.any(Object),
          universal: expect.any(Object),
        },
        display_scores: {
          english: expect.any(Object),
          universal: expect.any(Object),
        },
      },
    });
  });

  it("should return a 500 if botometer calls fails", async () => {
    // Given
    const handle = "StaniKulechov";
    getBotScoreMocked.mockImplementation(() => Promise.reject());

    // When
    const { req, res } = createNextMocks({
      query: { name: handle },
    });
    await handler(req, res);
    const user = await User.findByTwitterName(handle.toLowerCase());

    // Expect
    expect(res.statusCode).toBe(500);
    expect(user?.botometer?.display_scores?.universal.overall).toBeUndefined();
  });
});
