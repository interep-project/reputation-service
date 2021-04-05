import { mockBotometerData } from "src/mocks/botometerData";
import User from "src/models/users/User.model";
import { getBotScore } from "src/services/botometer";
import { getTwitterUserByUsername } from "src/services/twitter";
import { BasicTwitterReputation, TwitterUser } from "src/types/twitter";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import checkTwitterReputation from ".";

jest.mock("src/services/twitter", () => ({
  getTwitterUserByUsername: jest.fn(),
}));

jest.mock("src/services/botometer", () => ({
  getBotScore: jest.fn(),
}));

const getTwitterUserByUsernameMocked = getTwitterUserByUsername as jest.MockedFunction<
  typeof getTwitterUserByUsername
>;
const getBotscoreMocked = getBotScore as jest.MockedFunction<
  typeof getBotScore
>;

describe("checkTwitterReputation", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearDatabase();
  });

  it("should return user if reputation is already in DB", async () => {
    // Given
    const mockUser = {
      twitter: {
        user: { username: "vitalik" },
        reputation: BasicTwitterReputation.CONFIRMED,
      },
    };
    const mockUserTwitterUsername = mockUser.twitter.user.username;
    await new User(mockUser).save();

    // When
    const result = await checkTwitterReputation(mockUserTwitterUsername);

    // Expect
    expect(result?.twitter.user?.username).toEqual(mockUserTwitterUsername);
    expect(getTwitterUserByUsername).not.toHaveBeenCalled();
  });

  it("should call to fetch twitter data", async () => {
    await checkTwitterReputation("pmarca");

    expect(getTwitterUserByUsername).toHaveBeenCalledWith({
      username: "pmarca",
    });
  });

  it("should return null if no twitter data is returned", async () => {
    const result = await checkTwitterReputation("zzasdadsadsad");

    expect(result).toBeNull();
  });

  describe("Basic checks with Twitter data", () => {
    let twitterUser: TwitterUser;

    beforeEach(() => {
      // Given
      twitterUser = {
        username: "Username",
        created_at: "created_at",
        id: "id",
        name: "name",
        profile_image_url: "img_url",
        public_metrics: {
          tweet_count: 0,
          followers_count: 0,
          following_count: 0,
          listed_count: 0,
        },
        verified: false,
      };
      getTwitterUserByUsernameMocked.mockImplementation(() =>
        Promise.resolve(twitterUser)
      );
    });

    it("should perform basic checks and return user", async () => {
      // When
      const result = await checkTwitterReputation("username");

      // Expect
      expect(result?.twitter.user).toMatchObject({
        ...twitterUser,
        // username is stored in lowercase in DB
        username: twitterUser.username.toLowerCase(),
      });
      expect(
        Object.values(BasicTwitterReputation).includes(
          // @ts-expect-error: warning that it could be undefined but that's what we're checking here
          result?.twitter?.reputation
        )
      ).toBeTruthy();
    });

    it("should save user in DB", async () => {
      // When
      await checkTwitterReputation("username");
      const user = await User.findByTwitterUsername(twitterUser.username);

      // Expect
      expect(user?.twitter.user).toMatchObject({
        ...twitterUser,
        // username is stored in lowercase in DB
        username: twitterUser.username.toLowerCase(),
      });
      expect(
        Object.values(BasicTwitterReputation).includes(
          // @ts-expect-error: warning that it could be undefined but that's what we're checking here
          user?.twitter?.reputation
        )
      ).toBeTruthy();
    });
  });

  describe("Botometer", () => {
    let twitterUser: TwitterUser;

    beforeEach(() => {
      // Given
      twitterUser = {
        username: "amiabot",
        created_at: "created_at",
        id: "id",
        name: "Am I a bot?",
        profile_image_url: "img_url",
        public_metrics: {
          tweet_count: 3000,
          followers_count: 5342,
          following_count: 2349,
          listed_count: 34,
        },
        verified: false,
      };
      getTwitterUserByUsernameMocked.mockImplementation(() =>
        Promise.resolve(twitterUser)
      );
      getBotscoreMocked.mockImplementation(() =>
        Promise.resolve(mockBotometerData)
      );
    });
    it("should returned botometer data when reputation is not obvious", async () => {
      // When
      const response = await checkTwitterReputation(twitterUser.username);

      // Expect
      expect(response?.twitter.reputation).toBe(BasicTwitterReputation.UNCLEAR);
      expect(response?.twitter.botometer).toEqual({
        raw_scores: mockBotometerData.raw_scores,
        display_scores: mockBotometerData.display_scores,
        cap: mockBotometerData.cap,
      });
    });

    it("should save botometer data when reputation is not obvious ", async () => {
      await checkTwitterReputation(twitterUser.username);
      const user = await User.findByTwitterUsername(twitterUser.username);
      const userObject = user?.toObject();
      // Expect
      expect(user?.twitter.reputation).toBe(BasicTwitterReputation.UNCLEAR);
      expect(userObject?.twitter.botometer).toEqual({
        raw_scores: mockBotometerData.raw_scores,
        display_scores: mockBotometerData.display_scores,
        cap: mockBotometerData.cap,
      });
    });
  });
});
