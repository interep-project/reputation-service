import handler from "src/pages/api/reputation/twitter";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import createNextMocks from "src/mocks/createNextMocks";
import {
  AccountReputationByAccount,
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import { mockBotometerScores } from "src/mocks/botometerData";
import TwitterAccountController from "src/controllers/TwitterAccountController";

jest.mock("src/controllers/TwitterAccountController", () => ({
  getTwitterReputation: jest.fn(),
}));

const getTwitterReputationMocked = TwitterAccountController.getTwitterReputation as jest.MockedFunction<
  typeof TwitterAccountController.getTwitterReputation
>;

describe("api/reputation/twitter/[username]", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  it("should return a 405 if the method is not GET", async () => {
    const { req, res } = createNextMocks({
      query: {},
      method: "PUT",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(405);
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
    getTwitterReputationMocked.mockImplementation((req, res) =>
      Promise.resolve(res.status(200).send(accountReputation))
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
