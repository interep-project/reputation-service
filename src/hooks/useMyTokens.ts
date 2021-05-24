import { useCallback, useEffect, useState } from "react";

const useMyTokens = (
  address?: string
): { tokens: any[]; refetchTokens: () => Promise<null | undefined> } => {
  const [tokens, setTokens] = useState([]);

  const getMyTokens = useCallback(async () => {
    let response;
    try {
      response = await fetch(`/api/tokens/?owner=${address}`);
    } catch (err) {
      console.error(err);
    }

    if (response?.status === 200) {
      const { tokens } = await response.json();
      setTokens(tokens);
    } else {
      return null;
    }
  }, [address]);

  useEffect(() => {
    address && getMyTokens();
  }, [address, getMyTokens]);

  return { tokens, refetchTokens: getMyTokens };
};

export default useMyTokens;
