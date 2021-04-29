import { getSession } from "next-auth/client";
import { RequestMethod } from "node-mocks-http";
import linkAccounts from "src/core/linking";
import createNextMocks from "src/mocks/createNextMocks";
import { mockSession } from "src/mocks/session";
import Token from "src/models/tokens/Token.model";
import handler from "src/pages/api/linking";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";

jest.mock("src/core/linking", () => jest.fn());
jest.mock("next-auth/client", () => ({
  getSession: jest.fn(),
}));

const getSessionMocked = getSession as jest.MockedFunction<typeof getSession>;

const linkAccountsMocked = linkAccounts as jest.MockedFunction<
  typeof linkAccounts
>;

const bodyParams = {
  address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
  web2AccountId: "acountId",
  signature: "0x",
};
const createCall = (bodyOverride?: { [key: string]: unknown }) => ({
  body: {
    ...bodyParams,
    ...bodyOverride,
  },
  method: "PUT" as RequestMethod,
});

describe("api/linking", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should return a 405 if method is not PUT", async () => {
    // Given
    const { req, res } = createNextMocks({
      method: "GET",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(405);
  });

  it("should not authorize a user without session", async () => {
    // Given
    getSessionMocked.mockImplementation(() => Promise.resolve(null));

    const { req, res } = createNextMocks({
      method: "PUT",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(401);
  });

  describe("with Session", () => {
    beforeAll(() => {
      getSessionMocked.mockImplementation(() => Promise.resolve(mockSession));
    });

    it("should return 400 if a parameter is missing", async () => {
      const withoutAddress = createCall({ address: undefined });
      const withoutWeb2AccountId = createCall({ web2AccountId: undefined });
      const withoutSignature = createCall({ signature: undefined });

      const calls = [withoutAddress, withoutSignature, withoutWeb2AccountId];
      calls.forEach(async (call) => {
        const { req, res } = createNextMocks(call);

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
      });
    });

    it("should call linkAccounts and return 200", async () => {
      linkAccountsMocked.mockImplementation(({ address }) =>
        Promise.resolve(new Token({ userAddress: address }))
      );

      const { req, res } = createNextMocks(createCall());

      // When
      await handler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(200);
      expect(linkAccounts).toHaveBeenCalledWith(bodyParams);
    });

    it("should return an error if linkAccounts throws an error", async () => {
      linkAccountsMocked.mockImplementation(() =>
        Promise.reject(new Error("There was an error"))
      );

      const { req, res } = createNextMocks(createCall());

      // When
      await handler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual({ error: Error("There was an error") });
    });
  });
});
