import createMockTokenObject from "src/mocks/createMockToken";
import createNextMocks from "src/mocks/createNextMocks";
import Token from "src/models/tokens/Token.model";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import {
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import TokenController from "./TokenController";

jest.mock("src/core/linking", () => jest.fn());
jest.mock("next-auth/client", () => ({
  getSession: jest.fn(),
}));

describe("TokenController", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  describe("getReputationByAddress", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("should return a 400 if there is no address string in query", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: { address: 123 },
        method: "GET",
      });

      // When
      await TokenController.getReputationByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
    });

    it("should return a 400 if the address in query is not valid", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: { address: "0x123" },
        method: "GET",
      });

      // When
      await TokenController.getReputationByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
    });

    it("should return an empty response if there are now tokens associated with that address", async () => {
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      const { req, res } = createNextMocks({
        query: { address: zeroAddress },
        method: "GET",
      });

      // When
      await TokenController.getReputationByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual({ address: zeroAddress, results: [] });
    });

    it("should return the reputation for each token", async () => {
      const address = "0x800b7aa0965FD17374Ebf8BAfc9C9B567B765DaB";
      const web2Account = await TwitterAccount.create({
        provider: Web2Providers.TWITTER,
        providerAccountId: "1",
        isLinkedToAddress: true,
        basicReputation: BasicReputation.CONFIRMED,
        user: {
          id: "id",
          username: "username",
        },
      });
      await Token.create(
        createMockTokenObject({
          userAddress: address,
          web2Account: web2Account.id,
          issuanceTimestamp: Date.now(),
        })
      );

      const { req, res } = createNextMocks({
        query: { address },
        method: "GET",
      });

      // When
      await TokenController.getReputationByAddress(req, res);

      expect(res._getData()).toEqual({
        address: address,
        results: [
          {
            provider: "twitter",
            basicReputation: BasicReputation.CONFIRMED,
          },
        ],
      });
    });
  });
});
