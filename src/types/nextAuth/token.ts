import { JWT } from "next-auth/jwt";

export type JWToken = JWT & {
  twitter: { username: string; id: string };
};
