import { BasicTwitterReputation, TwitterUser } from "src/types/twitter";
import {
  checkBasicTwitterUserReputation,
  DEFAULT_PROFILE_IMG,
  isObviousLegitTwitterUser,
  isTwitterReputationNotSufficient,
} from "./basicChecks";

const getFakeTwitterUser = (override?: Partial<TwitterUser>): TwitterUser => ({
  name: "name",
  id: "id",
  public_metrics: {
    followers_count: 6990,
    following_count: 126,
    tweet_count: 12,
    listed_count: 5,
  },
  verified: false,
  profile_image_url: "profile_image_url",
  username: "username",
  created_at: "created_at",
  ...override,
});

describe("isObviousLegitTwitterUser", () => {
  it("should return true for verified users", () => {
    const user = getFakeTwitterUser({ verified: true });

    const result = isObviousLegitTwitterUser(user);

    expect(result).toBe(true);
  });

  it("should return true for accounts with high follower count", () => {
    const user = getFakeTwitterUser({
      public_metrics: {
        followers_count: 7001,
        following_count: 1,
        listed_count: 30,
        tweet_count: 300,
      },
    });

    const result = isObviousLegitTwitterUser(user);

    expect(result).toBe(true);
  });

  it("should return false otherwise", () => {
    const user = getFakeTwitterUser();

    const result = isObviousLegitTwitterUser(user);

    expect(result).toBe(false);
  });
});

describe("isTwitterReputationNotSufficient", () => {
  it("should return true if profile pic is the default one", () => {
    const user = getFakeTwitterUser({ profile_image_url: DEFAULT_PROFILE_IMG });

    const result = isTwitterReputationNotSufficient(user);

    expect(result).toBe(true);
  });

  it("should return true if they never tweeted", () => {
    // @ts-expect-error: override only one key in public_metrics
    const user = getFakeTwitterUser({ public_metrics: { tweet_count: 0 } });

    const result = isTwitterReputationNotSufficient(user);

    expect(result).toBe(true);
  });

  it("should return true if they have very few followers", () => {
    // @ts-expect-error: override only one key in public_metrics
    const user = getFakeTwitterUser({ public_metrics: { followers_count: 1 } });

    const result = isTwitterReputationNotSufficient(user);

    expect(result).toBe(true);
  });

  it("should return false otherwise", () => {
    const user = getFakeTwitterUser();

    const result = isTwitterReputationNotSufficient(user);

    expect(result).toBe(false);
  });
});

describe("checkBasicTwitterUserReputation", () => {
  it("should return CONFIRMED for legit users", () => {
    const user = getFakeTwitterUser({ verified: true });

    const result = checkBasicTwitterUserReputation(user);

    expect(result).toBe(BasicTwitterReputation.CONFIRMED);
  });

  it("should return NOT_SUFFICIENT if applicable", () => {
    const user = getFakeTwitterUser({ profile_image_url: DEFAULT_PROFILE_IMG });

    const result = checkBasicTwitterUserReputation(user);

    expect(result).toBe(BasicTwitterReputation.NOT_SUFFICIENT);
  });

  it("should return UNCLEAR otherwise", () => {
    const user = getFakeTwitterUser();

    const result = checkBasicTwitterUserReputation(user);

    expect(result).toBe(BasicTwitterReputation.UNCLEAR);
  });
});
