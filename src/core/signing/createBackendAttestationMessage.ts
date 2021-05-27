export type BackendAttestationMessageParams = {
  address: string;
  tokenIdHash: string;
  provider: string;
  providerAccountId: string;
};

export const createBackendAttestationMessage = ({
  address,
  tokenIdHash,
  provider,
  providerAccountId,
}: BackendAttestationMessageParams): string =>
  JSON.stringify({
    service: "InterRep",
    tokenIdHash,
    userAddress: address,
    web2Provider: provider,
    providerAccountId: providerAccountId,
  });
