import { verifyMessage } from "@ethersproject/wallet";
import linkAccounts from "src/core/linking";
import Web2Account from "src/models/web2Accounts/Web2Account.model";
import {
  BasicReputation,
  IWeb2AccountDocument,
  Web2Providers,
} from "src/models/web2Accounts/Web2Account.types";
import {
  clearDatabase,
  connect,
  dropDatabaseAndDisconnect,
} from "src/utils/server/testDatabase";

const addy = "0x622c62E3be972ABdF172DA466d425Df4C93470E4";
const getParams = (override?: Record<string, unknown>) => ({
  address: addy,
  signature: "signature",
  web2AccountId: "608a89a5346f2f9008feef8e",
  ...override,
});

jest.mock("@ethersproject/wallet", () => ({
  verifyMessage: jest.fn(),
}));

const verifyMessageMocked = verifyMessage as jest.MockedFunction<
  typeof verifyMessage
>;

describe("linkAccounts", () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  afterEach(async () => {
    await clearDatabase();
  });

  it("should throw if the address is invalid", () => {
    const badAddy = "0x123";
    expect(linkAccounts(getParams({ address: badAddy }))).rejects.toThrow(
      `Invalid address ${badAddy}`
    );
  });

  it("should throw if it fails retrieving the web 2 account", () => {
    expect(
      linkAccounts(getParams({ web2AccountId: "thisIdIsInvalid" }))
    ).rejects.toThrow(`Error retrieving web 2 account`);
  });

  it("should throw if there is no web 2 account for that id", () => {
    expect(linkAccounts(getParams())).rejects.toThrow(
      `Web 2 account not found`
    );
  });

  it("should throw if the account is already linked", async () => {
    const web2Account = await Web2Account.create({
      provider: Web2Providers.TWITTER,
      providerAccountId: "1",
      isLinkedToAddress: true,
    });

    expect(
      linkAccounts(getParams({ web2AccountId: web2Account.id }))
    ).rejects.toThrow(`Web 2 account already linked`);
  });

  it("should throw if the account's reputation is not defined", async () => {
    const web2Account = await Web2Account.create({
      provider: Web2Providers.TWITTER,
      providerAccountId: "1",
      isLinkedToAddress: false,
      basicReputation: undefined,
    });

    expect(
      linkAccounts(getParams({ web2AccountId: web2Account.id }))
    ).rejects.toThrow(`Insufficient account's reputation`);
  });

  it("should throw if the account's reputation is not CONFIRMED", async () => {
    const web2Account = await Web2Account.create({
      provider: Web2Providers.TWITTER,
      providerAccountId: "1",
      isLinkedToAddress: false,
      basicReputation: BasicReputation.UNCLEAR,
    });

    expect(
      linkAccounts(getParams({ web2AccountId: web2Account.id }))
    ).rejects.toThrow(`Insufficient account's reputation`);
  });

  describe("signature", () => {
    let web2Account: IWeb2AccountDocument;
    beforeEach(async () => {
      web2Account = await Web2Account.create({
        provider: Web2Providers.TWITTER,
        providerAccountId: "1",
        isLinkedToAddress: false,
        basicReputation: BasicReputation.CONFIRMED,
      });
    });

    it("should throw if the signature is invalid", () => {
      expect(
        linkAccounts(getParams({ web2AccountId: web2Account.id }))
      ).rejects.toThrow();
    });

    it("should throw if the signer is not the right one", () => {
      expect(
        linkAccounts(
          getParams({
            web2AccountId: web2Account.id,
            signature:
              "0xb3678d356cc39d2bb843ee0fa649e9b8a50abf0c8aa83d2a05a7f66d661c654b1531017cc1b4cc9a61c60e6cf9582b38d39a3cb2cfb5b04712f033ca7b7cb3fb1b",
          })
        )
      ).rejects.toThrow("Invalid signature");
    });
  });

  describe("OK", () => {
    beforeAll(() => {
      verifyMessageMocked.mockImplementation(() => addy);
    });

    let web2Account: IWeb2AccountDocument;
    beforeEach(async () => {
      web2Account = await Web2Account.create({
        provider: Web2Providers.TWITTER,
        providerAccountId: "1",
        isLinkedToAddress: false,
        basicReputation: BasicReputation.CONFIRMED,
      });
    });

    it("should change isLinkedToAddress to true and create a new token", async () => {
      const token = await linkAccounts(
        getParams({ web2AccountId: web2Account.id })
      );

      const account = await Web2Account.findById(web2Account.id);

      expect(account!.isLinkedToAddress).toBe(true);
      expect(token.userAddress).toBe(addy);
      expect(token.web2Account.toString()).toBe(web2Account.id);
    });
  });
});
