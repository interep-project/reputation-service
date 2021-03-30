import { createMocks, RequestMethod } from "node-mocks-http";
import User from "src/models/users/User.model";
import handler from "src/pages/api/twitter/[name]";
import {
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import { NextApiRequest, NextApiResponse } from "next";
import { RequestOptions } from "node:https";
import { mockBotometerData } from "src/tests/mocks/botometerData";
import { getBotScore } from "src/services/botometer";

jest.mock("src/services/botometer", () => ({
  getBotScore: jest.fn((name: string) =>
    Promise.resolve({ twitter: { user: name } })
  ),
}));

const createNextMocks = (
  reqOptions: (RequestOptions & { query: Record<string, string> }) | undefined
) =>
  createMocks<NextApiRequest, NextApiResponse>({
    // @ts-ignore
    method: "GET" as RequestMethod,
    ...reqOptions,
  });

describe.only("/twitter/[name]", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  beforeEach(() => jest.clearAllMocks());

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

  it("should save a new user", async () => {
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
      botometer: mockBotometerData,
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
    expect(getBotScore).not.toHaveBeenCalled();
  });
});
