import { checkIfUserSignatureIsValid } from "src/core/signing/checkIfUserSignatureIsValid"

const address = "0xEefc6026a202EA1B5129e84fEF229eBD412C3a5A"

describe("checkIfUserSignatureIsValid", () => {
    it("should return false if the signer does not match the given address and params", () => {
        const isSigvalid = checkIfUserSignatureIsValid({
            checksummedAddress: address,
            web2AccountId: "web2Id",
            userSignature:
                "0x567a5c4c8ea107f10746aba154a011331f12fa345b26b096819f5eafc3b45f30693c61ccfbb41844c3901048dab8d61cb155817a220015f9d7e710176489fe6d1b"
        })

        expect(isSigvalid).toBe(false)
    })

    it("should return true if the signer matches", () => {
        const isSigvalid = checkIfUserSignatureIsValid({
            checksummedAddress: address,
            web2AccountId: "608c4a10c994a377e232df7f",
            userSignature:
                "0x59f4262c3fd7ba49a2453e6718002c89d250d1cdced9ae7e2338a7773f60ff652920c2146a28705aad28112a93d28f0cbd8869632987f988ffddb4cd6825620d1b"
        })

        expect(isSigvalid).toBe(true)
    })
})
