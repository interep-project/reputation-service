import { checkIfUserSignatureIsValid } from "./checkIfUserSignatureIsValid";

const address = "0xd0a5d34aae14354a563f50541e11d9548a5f6540";

describe("checkIfUserSignatureIsValid", () => {
  it("should return false if the signer does not match the given address and params", () => {
    const isSigvalid = checkIfUserSignatureIsValid({
      checksummedAddress: address,
      web2AccountId: "web2Id",
      userSignature:
        "0x567a5c4c8ea107f10746aba154a011331f12fa345b26b096819f5eafc3b45f30693c61ccfbb41844c3901048dab8d61cb155817a220015f9d7e710176489fe6d1b",
    });

    expect(isSigvalid).toBe(false);
  });

  it("should return true if the signer matches", () => {
    const isSigvalid = checkIfUserSignatureIsValid({
      checksummedAddress: address,
      web2AccountId: "web2Id",
      userSignature:
        "0x09acbc016f68fed9c7a38a2b4033ff3e663cff89a86aefce8f1599523a01f55129f5b9990b6e66286c771e2e368484bd6832499f96085913ac6098cc6effb6351c",
    });

    expect(isSigvalid).toBe(true);
  });
});
