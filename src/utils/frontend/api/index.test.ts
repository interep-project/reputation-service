import sendRequest from "./sendRequest"

global.fetch = jest.fn(() => ({
    json: () => ({ data: "Hello World" }),
    status: 200
})) as any
global.console.error = jest.fn((message) => message)

describe("# utils/frontend/api", () => {
    describe("# sendRequest", () => {
        it("Should return a 200 response with data", async () => {
            const expectedValue = await sendRequest("http://fakeurl.com")

            expect(expectedValue).toBe("Hello World")
        })

        it("Should fail and return the error status with a server message", async () => {
            ;(global.fetch as any).mockImplementationOnce(() => ({
                text: () => "Error",
                status: 400
            }))

            const expectedValue = await sendRequest("http://fakeurl.com", {})

            expect(expectedValue).toBe(400)
            expect(global.console.error).toHaveBeenCalledWith("Error")
        })

        it("Should fail and return the error status without server message", async () => {
            ;(global.fetch as any).mockImplementationOnce(() => ({
                text: () => "",
                status: 400
            }))

            const expectedValue = await sendRequest("http://fakeurl.com", {}, "GET")

            expect(expectedValue).toBe(400)
            expect(global.console.error).toHaveBeenCalledWith("HTTP method GET failed")
        })

        it("Should fail by getting the json and return a 500 error", async () => {
            ;(global.fetch as any).mockImplementationOnce(() => ({
                json: () => {
                    throw new Error("Error")
                },
                status: 200
            }))

            const expectedValue = await sendRequest("http://fakeurl.com")

            expect(expectedValue).toBe(500)
        })
    })
})
