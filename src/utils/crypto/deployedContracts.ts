const deployedContracts = {
  // hardhat
  33137: {
    badgeFactory: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    twitterBadge: "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be",
  },
} as const;

export const isNetworkWithDeployedContract = (
  id?: number
): id is keyof typeof deployedContracts => !!id && id in deployedContracts;

export default deployedContracts;
