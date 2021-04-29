import handler from "src/pages/api/reputation/twitter/[id]";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import { checkTwitterReputation } from "src/core/reputation/twitter";
import createNextMocks from "src/mocks/createNextMocks";

jest.mock("src/services/botometer", () => ({
  getBotScore: jest.fn(),
}));
jest.mock("src/core/reputation/twitter", () => ({
  checkTwitterReputation: jest.fn(),
}));
// @ts-ignore: no idea
const checkTwitterReputationMocked = checkTwitterReputation as jest.MockedFunction<
  typeof checkTwitterReputation
>;

// TODO: TO UPDATE
describe("api/reputation/twitter/[username]", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  it("should return a 400 if a username is not provided", async () => {
    // Given
    const { req, res } = createNextMocks({
      query: {},
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(400);
  });

  it.skip("should return a 500 if user has no twitter reputation", async () => {
    // Given
    const handle = "problematicAccount";
    checkTwitterReputationMocked.mockImplementation(() =>
      Promise.resolve(null)
    );

    // When
    const { req, res } = createNextMocks({
      query: { username: handle },
    });
    await handler(req, res);
    const user = await User.findByTwitterUsername(handle.toLowerCase());

    // Expect
    expect(res.statusCode).toBe(500);
    expect(user).toBeNull();
  });

  it.skip("should return user.twitter", async () => {
    // Given
    const username = "username";
    const fakeUser = User.create({
      twitter: { user: { username }, reputation: "CONFIRMED" },
    });
    checkTwitterReputationMocked.mockImplementation(() =>
      Promise.resolve(fakeUser)
    );

    // When
    const { req, res } = createNextMocks({
      query: { username },
    });
    await handler(req, res);

    // Expect
    expect(res._getData().user.username).toBe(username);
    expect(res._getData().reputation).toBe((await fakeUser).twitter.reputation);
  });
});
