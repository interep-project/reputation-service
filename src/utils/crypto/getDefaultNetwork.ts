const networkByEnv = {
  test: { id: 31337, name: "hardhat" },
  development: { id: 31337, name: "localhost" },
  production: { id: 42, name: "kovan" },
};

export const getDefaultNetworkId = () => {
  const env = process.env.NODE_ENV;
  return env in networkByEnv ? networkByEnv[env].id : "31337";
};

export const getDefaultNetworkName = () => {
  const env = process.env.NODE_ENV;
  return env in networkByEnv ? networkByEnv[env].name : "hardhat";
};
