import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { TwitterUser } from "src/types/twitter";

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

export const checkBasicTwitterUserReputation = (
  twitterUser: TwitterUser
): BasicReputation => {
  if (isObviousLegitTwitterUser(twitterUser)) {
    return BasicReputation.CONFIRMED;
  }

  if (isTwitterReputationNotSufficient(twitterUser)) {
    return BasicReputation.NOT_SUFFICIENT;
  }

  return BasicReputation.UNCLEAR;
};
