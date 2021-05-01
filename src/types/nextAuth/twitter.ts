export type NextAuthTwitterAccount = {
  provider: string;
  type: string;
  id: string;
  accessToken: string;
  refreshToken: string;
  results: {
    user_id: string;
    screen_name: string;
  };
};
