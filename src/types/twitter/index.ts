export enum BasicTwitterReputation {
  CONFIRMED = "CONFIRMED",
  UNCLEAR = "UNCLEAR",
  NOT_SUFFICIENT = "NOT_SUFFICIENT",
}

export type TwitterUser = {
  name: string;
  id: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified: boolean;
  profile_image_url: string;
  username: string;
  created_at: string;
};
