import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import { Web2Providers } from "src/models/web2Accounts/Web2Account.types";
import { createTwitterAccountObject } from "src/utils/server/createNewTwitterAccount";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import handleSignIn from "./handleSignIn";

const providerAccountId = "user_id";
const providerAccountUsername = "screenName";
const accessToken = "accessToken";
const refreshToken = "refreshToken";

const createNexAuthAccount = (override?: any) => ({
  id: "id",
  provider: "twitter",
  type: "Oauth",
  accessToken,
  refreshToken,
  results: { user_id: providerAccountId, screen_name: providerAccountUsername },
  ...override,
});

describe("handleSignIn", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  it("should throw if the reponse has no user id", async () => {
    //
    expect(
      async () =>
        await handleSignIn(createNexAuthAccount({ results: { user_id: "" } }))
    ).rejects.toThrowError("Invalid account response");
  });

  it("should save the tokens on an exsting user", async () => {
    await TwitterAccount.create(
      createTwitterAccountObject({
        providerAccountId,
        user: { id: providerAccountId, username: "username" },
        isLinkedToAddress: false,
      })
    );

    const result = await handleSignIn(createNexAuthAccount());

    const twitterAccount = await Web2Account.findByProviderAccountId(
      Web2Providers.TWITTER,
      providerAccountId
    );

    expect(result).toBe(true);
    expect(twitterAccount!.accessToken).toBe(accessToken);
    expect(twitterAccount!.refreshToken).toBe(refreshToken);
  });

  it("should create the account if not existing in DB already", async () => {
    const result = await handleSignIn(createNexAuthAccount());

    const twitterAccount = await Web2Account.findByProviderAccountId(
      Web2Providers.TWITTER,
      providerAccountId
    );

    expect(result).toBe(true);
    expect(twitterAccount?.toObject()).toEqual(
      expect.objectContaining({
        providerAccountId,
        isLinkedToAddress: false,
        isSeedUser: false,
        accessToken,
        refreshToken,
        uniqueKey: `twitter:${providerAccountId}`,
        user: {
          id: providerAccountId,
          username: providerAccountUsername.toLowerCase(),
        },
      })
    );
  });
});
