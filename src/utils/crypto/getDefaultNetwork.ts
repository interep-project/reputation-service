import getConfig from "next/config";

export const getDefaultNetworkId = () => {
  const env = process.env.NODE_ENV;

  if (env === "test") return 31337;

  const { publicRuntimeConfig } = getConfig();
  const networks = publicRuntimeConfig.defaultNetworkByEnv;

  return env in networks ? networks[env].id : 31337;
};

export const getDefaultNetworkName = () => {
  const env = process.env.NODE_ENV;

  if (env === "test") return "hardhat";

  const { publicRuntimeConfig } = getConfig();
  const networks = publicRuntimeConfig.defaultNetworkByEnv;

  return env in networks ? networks[env].name : "hardhat";
};
