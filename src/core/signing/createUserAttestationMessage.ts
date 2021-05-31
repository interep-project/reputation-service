export type UserAttestationMessageParams = {
  checksummedAddress: string;
  web2AccountId: string;
};
// TODO: Improve with more explicit message to sign
export const createUserAttestationMessage = ({
  checksummedAddress,
  web2AccountId,
}: UserAttestationMessageParams): string =>
  `InterRep:${checksummedAddress}:${web2AccountId}`;
