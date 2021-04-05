import User from "src/models/users/User.model";
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
const getTwitterUserByUsernameMocked = getTwitterUserByUsername as jest.MockedFunction<
  typeof getTwitterUserByUsername
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

  it("should perform basic checks and return user", async () => {
    const twitterUser: TwitterUser = {
      username: "username",
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

    // When
    const result = await checkTwitterReputation("username");

    // Expect
    expect(result?.twitter.user).toMatchObject(twitterUser);
    expect(
      Object.values(BasicTwitterReputation).includes(
        // @ts-expect-error: warning that it could be undefined but that's what we're checking here
        result?.twitter?.reputation
      )
    ).toBeTruthy();
  });

  it("should save user in DB", async () => {
    // Given
    const twitterUser: TwitterUser = {
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
