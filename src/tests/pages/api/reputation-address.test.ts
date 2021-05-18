import handler from "src/pages/api/reputation/address/[address]";

import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import createNextMocks from "src/mocks/createNextMocks";
import TokenController from "src/controllers/TokenController";

describe("api/reputation/address", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  it("should return a 405 if the method is not GET", async () => {
    // Given
    const { req, res } = createNextMocks({
      query: {},
      method: "PUT",
    });

    // When
    await handler(req, res);

    // Expect
    expect(res._getStatusCode()).toBe(405);
  });

  it("should call getReputationByAddress", async () => {
    // Given
    jest.spyOn(TokenController, "getReputationByAddress");

    // When
    const { req, res } = createNextMocks({
      query: { address: "address" },
    });

    await handler(req, res);

    // Expect
    expect(res.statusCode).toBe(400);
    expect(TokenController.getReputationByAddress).toHaveBeenCalledWith(
      req,
      res
    );
  });
});
