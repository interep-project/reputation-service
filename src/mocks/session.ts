import { Session } from "next-auth";

export const mockSession: Session = {
  user: { name: "Joe" },
  expires: "123",
  web2AccountId: "394223",
  twitter: { userId: "12", username: "joe" },
};
