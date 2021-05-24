export type AssociationMessageProps = {
  address: string;
  web2AccountId: string;
};
// TODO: Improve with more explicit message to sign
export const createAssociationMessage = ({
  address,
  web2AccountId,
}: AssociationMessageProps): string => `InterRep:${address}:${web2AccountId}`;

export type BackendAssociationMessageProps = {
  address: string;
  provider: string;
  providerAccountId: string;
};

export const createBackendAssociationMessage = ({
  address,
  provider,
  providerAccountId,
}: BackendAssociationMessageProps): string =>
  `InterRep:${address}:${provider}:${providerAccountId}`;
