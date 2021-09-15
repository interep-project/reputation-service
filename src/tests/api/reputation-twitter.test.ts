import indexHandler from "src/pages/api/reputation/twitter";
import meHandler from "src/pages/api/reputation/twitter/me";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import createNextMocks from "src/mocks/createNextMocks";
import {
  AccountReputationByAccount,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import { mockBotometerScores } from "src/mocks/botometerData";
import TwitterAccountController from "src/controllers/TwitterAccountController";
import { ReputationLevel } from "@interrep/reputation-criteria";

jest.mock("src/controllers/TwitterAccountController", () => ({
  getTwitterReputation: jest.fn(),
  getMyTwitterReputation: jest.fn(),
}));

const getTwitterReputationMocked = TwitterAccountController.getTwitterReputation as jest.MockedFunction<
  typeof TwitterAccountController.getTwitterReputation
>;

describe("api/reputation/twitter", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  describe("index", () => {
    it("should return a 405 if the method is not GET", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: {},
        method: "PUT",
      });

      // When
      await indexHandler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(405);
    });

    it("should return the account reputation", async () => {
      // Given
      const username = "username";
      const accountReputation: AccountReputationByAccount = {
        provider: Web2Providers.TWITTER,
        basicReputation: ReputationLevel.NOT_SUFFICIENT,
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
      await indexHandler(req, res);

      // Expect
      expect(res._getData().user.username).toBe(username);
      expect(res._getData().basicReputation).toBe(
        accountReputation.basicReputation
      );
    });
  });

  describe("me", () => {
    it("should return a 405 if the method is not GET", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: {},
        method: "PUT",
      });

      // When
      await meHandler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(405);
    });

    it("should call getMyTwitterReputation", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: {},
        method: "GET",
      });

      // When
      await meHandler(req, res);

      // Expect
      expect(
        TwitterAccountController.getMyTwitterReputation
      ).toHaveBeenCalledWith(req, res);
    });
  });
});
