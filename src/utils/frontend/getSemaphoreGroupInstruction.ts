export const getSemaphoreGroupInstruction = ({
  connected,
  hasASession,
  twitterReputation,
}: {
  connected: boolean;
  hasASession: boolean;
  twitterReputation?: string;
}): string => {
  if (!connected) return "Please connect your wallet first.";

  if (!hasASession) return "Please sign in with a Twitter account.";

  if (twitterReputation)
    return `Join the TWITTER_${twitterReputation} group to allow applications to verify your reputation anonymously.`;

  return "";
};
