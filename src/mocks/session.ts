import { Session } from "next-auth";

export const mockSession: Session = {
  user: { name: "Joe" },
  expires: "123",
  web2AccountId: "6087dabb0b3af8703a581bef",
  twitter: { userId: "12", username: "joe" },
};
