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
}): string => {
  if (!connected) return "Please connect your wallet first.";

  if (!hasASession) return "Please sign in with a Twitter account.";

  if (isCurrentAccountLinked)
    return "Your account is linked to an Ethereum address.";

  if (!hasEnoughReputation)
    return "Sorry, we were unable to confirm the reputation of your Twitter account.";

  if (hasEnoughReputation)
    return "You can link your account to an Ethereum address.";

  return "";
};
