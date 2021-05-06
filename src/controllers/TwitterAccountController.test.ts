import { NextApiRequest } from "next";
import { getToken, JWT, JWTDecodeParams } from "next-auth/jwt";
import { WithAdditionalParams } from "next-auth/_utils";
import {
  checkTwitterReputationById,
  checkTwitterReputationByUsername,
} from "src/core/reputation/twitter";
import { mockBotometerScores } from "src/mocks/botometerData";
import createNextMocks from "src/mocks/createNextMocks";
import {
  AccountReputationByAccount,
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import { JWToken } from "src/types/nextAuth/token";
import TwitterAccountController from "./TwitterAccountController";

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

jest.mock("src/core/reputation/twitter", () => ({
  checkTwitterReputationByUsername: jest.fn(),
  checkTwitterReputationById: jest.fn(),
}));

const checkTwitterReputationByUsernameMocked = checkTwitterReputationByUsername as jest.MockedFunction<
  typeof checkTwitterReputationByUsername
>;

const checkTwitterReputationByIdMocked = checkTwitterReputationById as jest.MockedFunction<
  typeof checkTwitterReputationById
>;

type GetToken = (
  args?: {
    req: NextApiRequest;
    secureCookie?: boolean;
    cookieName?: string;
    raw?: string;
  } & JWTDecodeParams
) => Promise<WithAdditionalParams<JWT>>;

// @ts-ignore: todo
const getTokenMocked = getToken as jest.MockedFunction<GetToken>;

describe("getTwitterReputation", () => {
  it("should return a 400 if neither a username nor an id is provided", async () => {
    // Given
    const { req, res } = createNextMocks({
      query: {},
    });

    // When
    await TwitterAccountController.getTwitterReputation(req, res);

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
    await TwitterAccountController.getTwitterReputation(req, res);

    // Expect
    expect(res.statusCode).toBe(500);
  });

  it("should return the account reputation queried by username", async () => {
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
    await TwitterAccountController.getTwitterReputation(req, res);

    // Expect
    expect(res._getData().user.username).toBe(username);
    expect(res._getData().basicReputation).toBe(
      accountReputation.basicReputation
    );
  });

  it("should return the account reputation queried by id", async () => {
    // Given
    const id = "id";
    const accountReputation: AccountReputationByAccount = {
      provider: Web2Providers.TWITTER,
      basicReputation: BasicReputation.NOT_SUFFICIENT,
      user: { username: "username", id },
      botometer: mockBotometerScores,
    };
    checkTwitterReputationByIdMocked.mockImplementation(() =>
      Promise.resolve(accountReputation)
    );

    // When
    const { req, res } = createNextMocks({
      query: { id },
    });
    await TwitterAccountController.getTwitterReputation(req, res);

    // Expect
    expect(res._getData().user.id).toBe(id);
    expect(res._getData().basicReputation).toBe(
      accountReputation.basicReputation
    );
  });
});

describe("getMyTwitterReputation", () => {
  it("should return 401 if user is not signed in", async () => {
    // @ts-expect-error : can be null
    getTokenMocked.mockImplementationOnce(() => Promise.resolve(null));

    const { req, res } = createNextMocks();

    await TwitterAccountController.getMyTwitterReputation(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("should return 401 if user has no twitter id in token", async () => {
    const { req, res } = createNextMocks();

    getTokenMocked.mockImplementationOnce(() =>
      Promise.resolve({ web2AccountId: "web2Id" })
    );

    await TwitterAccountController.getMyTwitterReputation(req, res);

    expect(res._getStatusCode()).toBe(401);
  });

  it("should return the twitter reputation of a signed in user", async () => {
    const twitterUserId = "twitterUserId";

    getTokenMocked.mockImplementationOnce(() =>
      Promise.resolve({
        web2AccountId: "web2Id",
        twitter: { userId: twitterUserId },
      })
    );

    const accountReputation: AccountReputationByAccount = {
      provider: Web2Providers.TWITTER,
      basicReputation: BasicReputation.NOT_SUFFICIENT,
      user: { username: "username", id: twitterUserId },
      botometer: mockBotometerScores,
    };
    checkTwitterReputationByIdMocked.mockImplementation(() =>
      Promise.resolve(accountReputation)
    );

    const { req, res } = createNextMocks();

    await TwitterAccountController.getMyTwitterReputation(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(checkTwitterReputationByIdMocked).toHaveBeenCalledWith(
      twitterUserId
    );
    expect(res._getData()).toEqual(accountReputation);
  });

  it("should return a 500 if an error occurs", async () => {
    getTokenMocked.mockImplementationOnce(() =>
      Promise.resolve({
        web2AccountId: "web2Id",
        twitter: { userId: "userId" },
      })
    );

    checkTwitterReputationByIdMocked.mockImplementation(() =>
      Promise.resolve(null)
    );

    const { req, res } = createNextMocks();

    await TwitterAccountController.getMyTwitterReputation(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
