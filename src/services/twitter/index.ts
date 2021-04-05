import Twitter from "twitter-v2";
import config from "src/config";
import { TwitterUser } from "src/types/twitter";

const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = config;

if (!TWITTER_CONSUMER_KEY || !TWITTER_CONSUMER_SECRET) {
  throw Error("Twitter keys not provided");
}

const client = new Twitter({
  consumer_key: config.TWITTER_CONSUMER_KEY || "",
  consumer_secret: config.TWITTER_CONSUMER_SECRET || "",
});

const requestedFields = {
  "user.fields": [
    "id",
    "profile_image_url",
    "public_metrics",
    "verified",
    "created_at",
  ],
};

export const getTwitterUserByUsername = async ({
  username,
}: {
  username: string;
}): Promise<TwitterUser | null> => {
  if (!username) return null;

  // https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by-username-username
  const { data } = await client.get(
    `users/by/username/${username}`,
    requestedFields
  );

  return data || null;
};
