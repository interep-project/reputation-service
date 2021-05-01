import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export type JWToken = JWT & {
  web2AccountId: string;
  twitter?: { username: string; userId: string };
};

export type CustomSession = Session & {
  web2AccountId: string;
  twitter?: { username: string; userId: string };
};
