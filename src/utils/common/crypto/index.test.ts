import * as encryption from "./encryptMessage"

jest.spyOn(encryption, "encryptMessage")

jest.mock("ethers", () => {
    // Require the original module to not be mocked...
    const originalModule = jest.requireActual("ethers")

    return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        ethers: {
            utils: {
                hexlify: originalModule.ethers.utils.hexlify,
                randomBytes: jest.fn().mockReturnValue([63, 129, 117, 76, 129, 36, 152, 59, 179, 24, 0, 139])
            }
        }
    }
})

describe("encryptMessageWithSalt", () => {
    const pubKey = "C5YMNdqE4kLgxQhJO1MfuQcHP5hjVSXzamzd/TxlR0U="
    it("should return a string", () => {
        const result = encryption.encryptMessageWithSalt(pubKey, "hello")

        expect(typeof result).toBe("string")
    })

    // TODO: TO FIX
    // it("should encrypt after adding a salt", () => {
    // expect(encryption.encryptMessage).toHaveBeenCalledWith(pubKey, {
    //   message: "hello",
    //   salt:
    //     "0x5b36332c3132392c3131372c37362c3132392c33362c3135322c35392c3137392c32342c302c3133395d",
    // });
    // });
})
