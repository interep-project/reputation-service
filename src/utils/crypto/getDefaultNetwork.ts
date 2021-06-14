import { defaultNetworkByEnv } from "src/config";

export const getDefaultNetworkId = () => {
  const env = process.env.NODE_ENV;

  if (env === "test") return 31337;

  return env in defaultNetworkByEnv ? defaultNetworkByEnv[env].id : 31337;
};

export const getDefaultNetworkName = () => {
  const env = process.env.NODE_ENV;

  if (env === "test" || !env) return "hardhat";

  return env in defaultNetworkByEnv ? defaultNetworkByEnv[env].name : "hardhat";
};
