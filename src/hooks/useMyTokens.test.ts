/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react-hooks";
// import { rest } from "msw";
// import { setupServer } from "msw/node";
import useMyTokens from "./useMyTokens";

const mockFetch = jest.fn();
global.fetch = mockFetch;

// const server = setupServer(
//   rest.get(`/api/tokens/`, (req, res, ctx) => {
//     return res(ctx.json({ tokens: ["foo", "bar"] }));
//   })
// );

describe("useMyTokens", () => {
  it("should call the /tokens route", () => {
    const userAddy = "0xc58Bb74606b73c5043B75d7Aa25ebe1D5D4E7c72";
    const { result } = renderHook(() => useMyTokens(userAddy));

    act(() => {
      result.current.refetchTokens();
    });

    expect(mockFetch).toHaveBeenCalledWith(`/api/tokens/?owner=${userAddy}`);
  });

  it("should set tokens if the response status is a 200", async () => {
    mockFetch.mockImplementationOnce(() => ({
      status: 200,
      json: () => ({ tokens: ["foo", "bar"] }),
    }));

    const userAddy = "0xc58Bb74606b73c5043B75d7Aa25ebe1D5D4E7c72";
    const { result } = renderHook(() => useMyTokens(userAddy));

    await act(async () => {
      await result.current.refetchTokens();
    });

    expect(result.current.tokens).toEqual(["foo", "bar"]);
  });
});
