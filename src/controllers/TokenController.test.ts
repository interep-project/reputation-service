import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus";
import mintToken from "src/core/linking/mintToken";
import createMockTokenObject from "src/mocks/createMockToken";
import createNextMocks from "src/mocks/createNextMocks";
import Token from "src/models/tokens/Token.model";
import logger from "src/utils/server/logger";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import TokenController from "./TokenController";

jest.mock(
  "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus",
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);

jest.mock("src/utils/server/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
  },
}));

jest.mock("src/core/linking/mintToken", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("TokenController", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  // describe("getReputationByAddress", () => {
  //   beforeEach(async () => {
  //     await clearDatabase();
  //   });

  //   it("should return a 400 if there is no address string in query", async () => {
  //     // Given
  //     const { req, res } = createNextMocks({
  //       query: { address: 123 },
  //       method: "GET",
  //     });

  //     // When
  //     await TokenController.getReputationByAddress(req, res);

  //     // Expect
  //     expect(res._getStatusCode()).toBe(400);
  //   });

  //   it("should return a 400 if the address in query is not valid", async () => {
  //     // Given
  //     const { req, res } = createNextMocks({
  //       query: { address: "0x123" },
  //       method: "GET",
  //     });

  //     // When
  //     await TokenController.getReputationByAddress(req, res);

  //     // Expect
  //     expect(res._getStatusCode()).toBe(400);
  //   });

  //   it("should return an empty response if there are now tokens associated with that address", async () => {
  //     const zeroAddress = "0x0000000000000000000000000000000000000000";
  //     const { req, res } = createNextMocks({
  //       query: { address: zeroAddress },
  //       method: "GET",
  //     });

  //     // When
  //     await TokenController.getReputationByAddress(req, res);

  //     // Expect
  //     expect(res._getStatusCode()).toBe(200);
  //     expect(res._getData()).toEqual({ address: zeroAddress, results: [] });
  //   });

  //   it("should return the reputation for each token", async () => {
  //     const address = "0x800b7aa0965FD17374Ebf8BAfc9C9B567B765DaB";
  //     const web2Account = await TwitterAccount.create({
  //       provider: Web2Providers.TWITTER,
  //       providerAccountId: "1",
  //       isLinkedToAddress: true,
  //       basicReputation: BasicReputation.CONFIRMED,
  //       user: {
  //         id: "id",
  //         username: "username",
  //       },
  //     });
  //     await Token.create(
  //       createMockTokenObject({
  //         userAddress: address,
  //         web2Account: web2Account.id,
  //         issuanceTimestamp: Date.now(),
  //       })
  //     );

  //     const { req, res } = createNextMocks({
  //       query: { address },
  //       method: "GET",
  //     });

  //     // When
  //     await TokenController.getReputationByAddress(req, res);

  //     expect(res._getData()).toEqual({
  //       address: address,
  //       results: [
  //         {
  //           provider: "twitter",
  //           basicReputation: BasicReputation.CONFIRMED,
  //         },
  //       ],
  //     });
  //   });
  // });

  describe("getTokensByAddress", () => {
    beforeEach(async () => {
      await clearDatabase();
    });

    it("should return a 400 if there is no owner string in query", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: { owner: 123 },
        method: "GET",
      });

      // When
      await TokenController.getTokensByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
    });

    it("should return a 400 if the address in query is not valid", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: { owner: "0x123" },
        method: "GET",
      });

      // When
      await TokenController.getTokensByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual("Invalid address");
    });

    it("should return an empty array if there is no tokens for that address", async () => {
      // Given
      const { req, res } = createNextMocks({
        query: { owner: "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740" },
        method: "GET",
      });

      // When
      await TokenController.getTokensByAddress(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual({ tokens: [] });
    });

    it("should update and return found tokens", async () => {
      const userAddress = "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740";

      const tokenMock = await Token.create(
        createMockTokenObject({
          userAddress,
        })
      );

      const { req, res } = createNextMocks({
        query: { owner: userAddress },
        method: "GET",
      });

      await TokenController.getTokensByAddress(req, res);

      expect(checkAndUpdateTokenStatus).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual({ tokens: [tokenMock.toJSON()] });
    });

    it("should return 500 and log the error", async () => {
      const err = new Error("Error updating tokens");
      // @ts-expect-error: mocked above
      checkAndUpdateTokenStatus.mockImplementationOnce(() => {
        throw err;
      });

      const userAddress = "0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740";

      await Token.create(
        createMockTokenObject({
          userAddress,
        })
      );

      const { req, res } = createNextMocks({
        query: { owner: userAddress },
        method: "GET",
      });

      await TokenController.getTokensByAddress(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(err);
    });
  });

  describe("mintToken", () => {
    it("should return a 400 if not token id was passed", async () => {
      const { req, res } = createNextMocks({
        body: {},
        method: "PUT",
      });

      await TokenController.mintToken(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should call mintToken with tokenId and return the tx response", async () => {
      const txResponseMock = { hash: "hash" };
      // @ts-expect-error: mocked above
      mintToken.mockImplementationOnce(() => txResponseMock);

      const tokenId = "0xaaaaa";
      const { req, res } = createNextMocks({
        body: { tokenId },
        method: "PUT",
      });

      await TokenController.mintToken(req, res);

      expect(mintToken).toHaveBeenCalledWith(tokenId);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(txResponseMock);
    });

    it("should return 400 and send the error", async () => {
      const err = new Error("Invalid operation");
      // @ts-expect-error: mocked above
      mintToken.mockImplementationOnce(() => {
        throw err;
      });

      const tokenId = "0xaaaaa";
      const { req, res } = createNextMocks({
        body: { tokenId },
        method: "PUT",
      });

      await TokenController.mintToken(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({ error: err.message });
      expect(logger.error).toHaveBeenCalledWith(err);
    });
  });
});
