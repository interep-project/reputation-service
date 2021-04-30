import handler from "src/pages/api/reputation/twitter";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import { checkTwitterReputationByUsername } from "src/core/reputation/twitter";
import createNextMocks from "src/mocks/createNextMocks";
import { findByTwitterUsername } from "src/models/web2Accounts/twitter/utils";
import {
  AccountReputationByAccount,
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import { mockBotometerScores } from "src/mocks/botometerData";

jest.mock("src/services/botometer", () => ({
  getBotScore: jest.fn(),
}));
jest.mock("src/core/reputation/twitter", () => ({
  checkTwitterReputationByUsername: jest.fn(),
}));
// @ts-ignore: no idea
const checkTwitterReputationByUsernameMocked = checkTwitterReputationByUsername as jest.MockedFunction<
  typeof checkTwitterReputationByUsername
>;

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

  it("should return a 500 if user has no twitter reputation", async () => {
    // Given
    const handle = "problematicAccount";
    checkTwitterReputationByUsernameMocked.mockImplementation(() =>
      Promise.resolve(null)
    );

    // When
    const { req, res } = createNextMocks({
      query: { username: handle },
    });
    await handler(req, res);
    const user = await findByTwitterUsername(handle.toLowerCase());

    // Expect
    expect(res.statusCode).toBe(500);
    expect(user).toBeNull();
  });

  it("should return the account reputation", async () => {
    // Given
    const username = "username";
    const accountReputation: AccountReputationByAccount = {
      provider: Web2Providers.TWITTER,
      basicReputation: BasicReputation.NOT_SUFFICIENT,
      user: { username, id: "id" },
      botometer: mockBotometerScores,
    };
    checkTwitterReputationByUsernameMocked.mockImplementation(() =>
      Promise.resolve(accountReputation)
    );

    // When
    const { req, res } = createNextMocks({
      query: { username },
    });
    await handler(req, res);

    // Expect
    expect(res._getData().user.username).toBe(username);
    expect(res._getData().basicReputation).toBe(
      accountReputation.basicReputation
    );
  });
});
