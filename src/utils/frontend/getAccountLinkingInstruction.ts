export const getAccountLinkingInstruction = ({
  connected,
  hasASession,
  isCurrentAccountLinked,
  hasEnoughReputation,
}: {
  connected: boolean;
  hasASession: boolean;
  isCurrentAccountLinked?: boolean;
  hasEnoughReputation: boolean;
}): string | null => {
  if (!connected) return "Please connect your wallet first.";

  if (!hasASession) return "Please sign in to a web 2 account.";

  if (isCurrentAccountLinked)
    return "Your account is already linked to an Ethereum address.";

  if (!hasEnoughReputation)
    return "Sorry, we were unable to confirm the reputation of your Twitter account.";

  if (hasEnoughReputation)
    return "Your account is not linked to any Ethereum address.";

  return null;
};
