import {
  getDefaultNetworkId,
  getDefaultNetworkName,
} from "./getDefaultNetwork";

const mock = <T extends {}, K extends keyof T>(
  object: T,
  property: K,
  value: T[K]
) => {
  Object.defineProperty(object, property, { get: () => value });
};

describe("getDefaultNetworkId", () => {
  beforeAll(() => {
    mock(process.env, "NODE_ENV", jest.fn());
  });

  it("should return hardhat network id for test", () => {
    expect(getDefaultNetworkId()).toBe(31337);
  });

  it("should return local hardhat network id for development", () => {
    jest
      .spyOn(process.env, "NODE_ENV", "get")
      .mockReturnValueOnce("development");

    expect(getDefaultNetworkId()).toBe(31337);
  });

  it("should return local hardhat network id for production", () => {
    jest
      .spyOn(process.env, "NODE_ENV", "get")
      .mockReturnValueOnce("production");

    expect(getDefaultNetworkId()).toBe(42);
  });
});

describe("getDefaultNetworkName", () => {
  beforeAll(() => {
    mock(process.env, "NODE_ENV", jest.fn());
  });

  it("should return hardhat network id for test", () => {
    expect(getDefaultNetworkName()).toBe("hardhat");
  });

  it("should return local hardhat network id for development", () => {
    jest
      .spyOn(process.env, "NODE_ENV", "get")
      .mockReturnValueOnce("development");

    expect(getDefaultNetworkName()).toBe("localhost");
  });

  it("should return local hardhat network id for production", () => {
    jest
      .spyOn(process.env, "NODE_ENV", "get")
      .mockReturnValueOnce("production");

    expect(getDefaultNetworkName()).toBe("kovan");
  });
});
