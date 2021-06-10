import { DeployedContracts } from "src/utils/crypto/deployedContracts";
import { getNFTMetadataObject } from "./getNFTMetadataObject";

describe("getNFTMetadataObject", () => {
  it("should return null for an invalid contract", () => {
    // @ts-expect-error: invalid contract address
    const result = getNFTMetadataObject("0x");

    expect(result).toBe(null);
  });

  it("should return the right metadata for the Twitter badge", () => {
    expect(getNFTMetadataObject(DeployedContracts.TWITTER_BADGE)).toEqual({
      description: "InterRep reputation badge for a Twitter account.",
      image: "",
      name: "InterRep Twitter Reputation Badge",
    });
  });
});
