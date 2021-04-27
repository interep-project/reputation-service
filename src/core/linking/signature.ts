export type AssociationMessageProps = {
  address: string;
  web2AccountId: string;
};
export const createAssociationMessage = ({
  address,
  web2AccountId,
}: AssociationMessageProps) => `InterRep:${address}:${web2AccountId}`;
