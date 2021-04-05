import { TwitterUser } from "src/types/twitter";

export enum BasicTwitterReputation {
  CONFIRMED = "CONFIRMED",
  UNCLEAR = "UNCLEAR",
  NOT_SUFFICIENT = "NOT_SUFFICIENT",
}

const HIGH_TWITTER_FOLLOWERS_THRESHOLD = 7000;
const LOW_TWITTER_FOLLOWERS_THRESHOLD = 2;
export const DEFAULT_PROFILE_IMG =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png";

export const isObviousLegitTwitterUser = (
  twitterUser: TwitterUser
): boolean => {
  // Is verified
  if (twitterUser.verified) return true;

  // Has "enough" followers
  if (
    twitterUser.public_metrics.followers_count >
    HIGH_TWITTER_FOLLOWERS_THRESHOLD
  ) {
    return true;
  }

  return false;
};

export const isTwitterReputationNotSufficient = (
  twitterUser: TwitterUser
): boolean => {
  // Profile pic is the default one
  if (twitterUser.profile_image_url === DEFAULT_PROFILE_IMG) return true;

  // Never tweeted
  if (twitterUser.public_metrics.tweet_count === 0) return true;

  // Low follower count
  if (
    twitterUser.public_metrics.followers_count <=
    LOW_TWITTER_FOLLOWERS_THRESHOLD
  ) {
    return true;
  }

  return false;
};

export const checkTwitterUserReputation = (
  twitterUser: TwitterUser
): BasicTwitterReputation => {
  if (isObviousLegitTwitterUser(twitterUser)) {
    return BasicTwitterReputation.CONFIRMED;
  }

  if (isTwitterReputationNotSufficient(twitterUser)) {
    return BasicTwitterReputation.NOT_SUFFICIENT;
  }

  return BasicTwitterReputation.UNCLEAR;
};
