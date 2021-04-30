import { mockBotometerScores } from "src/mocks/botometerData";
import Token from "src/models/tokens/Token.model";
import TwitterAccount from "src/models/web2Accounts/twitter/TwitterAccount.model";
import {
  BasicReputation,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import {
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";
import getReputationFromToken from "./getReputationFromToken";

describe("getReputationFromToken", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  it("should return null if the web account is not found", async () => {
    const token = await Token.create({
      web2Account: "608ae9611f0d263e6da446ff",
      issuanceTimestamp: Date.now(),
    });

    const result = await getReputationFromToken(token);

    expect(result).toBeNull();
  });

  it("should return reputation for a twitter account", async () => {
    const mockTwitterAccount = {
      provider: Web2Providers.TWITTER,
      user: {
        id: "1",
        username: "username",
      },
      providerAccountId: "1",
      isLinkedToAddress: false,
      basicReputation: BasicReputation.UNCLEAR,
      botometer: mockBotometerScores,
    };
    const twitterAccount = await TwitterAccount.create(mockTwitterAccount);

    const token = await Token.create({
      web2Account: twitterAccount.id,
      issuanceTimestamp: Date.now(),
    });

    const result = await getReputationFromToken(token);

    expect(result).toEqual({
      provider: mockTwitterAccount.provider,
      basicReputation: mockTwitterAccount.basicReputation,
    });
  });
});
