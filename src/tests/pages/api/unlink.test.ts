import createNextMocks from "src/mocks/createNextMocks";
import jwt from "next-auth/jwt";
import handler from "src/pages/api/linking/unlink";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import unlinkAccounts from "src/core/linking/unlink";
import logger from "src/utils/server/logger";

jest.mock("src/core/linking/unlink", () => jest.fn());
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));
jest.spyOn(logger, "error");

const getTokenMocked = jwt.getToken as jest.MockedFunction<typeof jwt.getToken>;
const unlinkAccountsMocked = unlinkAccounts as jest.MockedFunction<
  typeof unlinkAccounts
>;

describe("api/linking/unlink", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  beforeEach(async () => {
    await clearDatabase();
  });

  it("should return a 500 if there is an error getting the JWT", async () => {
    // Given
    getTokenMocked.mockImplementationOnce(() => Promise.reject(new Error()));

    const { req, res } = createNextMocks({
      method: "PUT",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(500);
  });

  it("should return a 403 if there is no ID in the JWT", async () => {
    // Given
    getTokenMocked.mockImplementationOnce(() => Promise.resolve(""));

    const { req, res } = createNextMocks({
      method: "PUT",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(403);
  });

  it("should call unlinkAccounts with the right parameters", async () => {
    const decryptedAttestation = "decrypted";
    const web2AccountIdFromSession = "web2Id";
    getTokenMocked.mockImplementationOnce(() =>
      // @ts-ignore: resolves to a JWT
      Promise.resolve({ web2AccountId: web2AccountIdFromSession })
    );

    const { req, res } = createNextMocks({
      method: "PUT",
      body: ({
        decryptedAttestation,
      } as unknown) as Body,
    });

    // When
    await handler(req, res);

    // Expect
    expect(unlinkAccountsMocked).toHaveBeenCalledWith({
      web2AccountIdFromSession,
      decryptedAttestation,
    });
  });

  describe("unlink", () => {
    const decryptedAttestation = "decryptedAttestation";
    const web2AccountIdFromSession = "web2Id";
    beforeAll(() => {
      getTokenMocked.mockImplementation(() =>
        // @ts-ignore: resolves to a JWT
        Promise.resolve({ web2AccountId: web2AccountIdFromSession })
      );
    });

    it("should send back result if it succeeded", async () => {
      const result = { success: true, foo: "bar" };
      unlinkAccountsMocked.mockImplementationOnce(() =>
        Promise.resolve(result)
      );

      const { req, res } = createNextMocks({
        method: "PUT",
        body: ({
          decryptedAttestation,
        } as unknown) as Body,
      });

      // When
      await handler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toEqual(result);
    });

    it("should send back the result if it did not suceed", async () => {
      const result = { success: false, error: "error" };
      unlinkAccountsMocked.mockImplementationOnce(() =>
        Promise.resolve(result)
      );

      const { req, res } = createNextMocks({
        method: "PUT",
        body: ({
          decryptedAttestation,
        } as unknown) as Body,
      });

      // When
      await handler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(400);
      expect(res._getData()).toEqual(result);
      expect(logger.error).toHaveBeenCalledWith(result.error);
    });

    it("should catch an error", async () => {
      const mockError = new Error("fail");
      unlinkAccountsMocked.mockImplementationOnce(() =>
        Promise.reject(mockError)
      );

      const { req, res } = createNextMocks({
        method: "PUT",
        body: ({
          decryptedAttestation,
        } as unknown) as Body,
      });

      // When
      await handler(req, res);

      // Expect
      expect(res._getStatusCode()).toBe(500);
      expect(logger.error).toHaveBeenCalledWith(mockError);
    });
  });
});
