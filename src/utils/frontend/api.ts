export function getTwitterReputation(): Promise<any | null> {
  return sendRequest("api/reputation/twitter/me");
}

export function getTokens({
  ownerAddress,
}: {
  ownerAddress: string;
}): Promise<any | null> {
  return sendRequest(`api/tokens/?owner=${ownerAddress}`);
}

export async function checkLink(): Promise<any | null> {
  return sendRequest("api/linking/checkLink");
}

export function mintToken({
  tokenId,
}: {
  tokenId: string;
}): Promise<any | null> {
  return sendRequest("api/tokens/mint", { tokenId });
}

export function addIdentityCommitment({
  groupId,
  identityCommitment,
  web2AccountId,
}: {
  groupId: string;
  identityCommitment: string;
  web2AccountId: string;
}): Promise<any | null> {
  return sendRequest(`api/groups/${groupId}`, {
    identityCommitment,
    web2AccountId,
  });
}

export function unlinkAccounts({
  decryptedAttestation,
}: {
  decryptedAttestation: string;
}): Promise<any | null> {
  return sendRequest("api/linking/unlink", { decryptedAttestation });
}

export function linkAccounts({
  chainId,
  address,
  web2AccountId,
  userSignature,
  userPublicKey,
}: {
  chainId: number;
  address: string;
  web2AccountId: string;
  userSignature: string;
  userPublicKey: string;
}): Promise<any | null> {
  return sendRequest(
    "api/linking",
    {
      chainId,
      address,
      web2AccountId,
      userSignature,
      userPublicKey,
    },
    "PUT"
  );
}

async function sendRequest(
  url: string,
  body?: any,
  method = body ? "POST" : "GET"
): Promise<any | null> {
  const response = await fetch(url, {
    method,
    body: JSON.stringify(body),
  });

  if (response.status !== 200 && response.status !== 201) {
    const error = await response.text();

    console.error(error || `HTTP method ${method} failed`);

    return null;
  }

  try {
    const { data } = await response.json();

    return data;
  } catch {
    return;
  }
}
