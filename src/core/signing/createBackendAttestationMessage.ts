export type BackendAttestationMessageParams = {
  address: string;
  provider: string;
  providerAccountId: string;
};

export const createBackendAttestationMessage = ({
  address,
  provider,
  providerAccountId,
}: BackendAttestationMessageParams): string =>
  `InterRep:${address}:${provider}:${providerAccountId}`;
