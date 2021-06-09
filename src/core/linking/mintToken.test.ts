import {
  dropDatabaseAndDisconnect,
  connect,
} from "src/utils/server/testDatabase";
import checkAndUpdateTokenStatus from "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus";
import mintToken from "./mintToken";
import createMockTokenObject from "src/mocks/createMockToken";
import Token from "src/models/tokens/Token.model";
import { ITokenDocument, TokenStatus } from "src/models/tokens/Token.types";
import mintNewToken from "src/core/blockchain/ReputationBadge/mintNewToken";

const mockTxResponse = {
  hash: "hash",
  blockNumber: 123,
  chainId: 888,
  timestamp: 121212,
};
jest.mock("src/core/blockchain/ReputationBadge/mintNewToken", () => ({
  __esModule: true,
  default: jest.fn(() => mockTxResponse),
}));

jest.mock(
  "src/core/blockchain/ReputationBadge/checkAndUpdateTokenStatus",
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);

const checkAndUpdateTokenStatusMocked = checkAndUpdateTokenStatus as jest.MockedFunction<
  typeof checkAndUpdateTokenStatus
>;

describe("mintToken", () => {
  let mockToken: ITokenDocument;

  beforeAll(async () => {
    await connect();
    mockToken = await Token.create(createMockTokenObject());
  });

  afterAll(async () => await dropDatabaseAndDisconnect());

  it("should throw if token is not found", async () => {
    expect(
      async () => await mintToken("60b12200d5053f71362feed0")
    ).rejects.toThrowError("token with id 60b12200d5053f71362feed0 not found");
  });

  it("should only mint a token with a status of NOT_MINTED", async () => {
    checkAndUpdateTokenStatusMocked.mockImplementationOnce(([token]) => {
      token.status = TokenStatus.MINT_PENDING;
      token.save();
      return Promise.resolve(undefined);
    });

    try {
      await mintToken(mockToken.id);
    } catch (err) {
      expect(err).toEqual(Error("Can't mint a token with status MINT_PENDING"));
    }
  });

  it("should call mintNewToken with the right arguments and update the token status", async () => {
    const txResponse = await mintToken(mockToken.id);

    expect(mintNewToken).toHaveBeenCalledWith({
      badgeAddress: mockToken.contractAddress,
      to: mockToken.userAddress,
      tokenId: mockToken.decimalId,
    });

    const tken = await Token.findById(mockToken.id);

    expect(tken!.status).toBe(TokenStatus.MINT_PENDING);

    expect(txResponse).toEqual(mockTxResponse);
  });
});
