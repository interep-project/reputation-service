import { defaultNetworkByEnv } from "src/config";

export const isDefaultNetworkId = (networkId: number): boolean => {
  return networkId === getDefaultNetworkId();
};

export const getDefaultNetworkId = (): number => {
  const env = process.env.NODE_ENV;

  if (env === "test") return 31337;

  return env in defaultNetworkByEnv
    ? Number(defaultNetworkByEnv[env].id)
    : 31337;
};

export const getDefaultNetworkName = (): string => {
  const env = process.env.NODE_ENV;

  if (env === "test" || !env) return "hardhat";

  return env in defaultNetworkByEnv ? defaultNetworkByEnv[env].name : "hardhat";
};
