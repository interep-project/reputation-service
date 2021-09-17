import { Session } from "next-auth"

const mockSession: Session = {
    provider: "twitter",
    expires: "123",
    web2AccountId: "6087dabb0b3af8703a581bef",
    user: { id: "12", username: "joe", name: "Joe" }
}

export default mockSession
