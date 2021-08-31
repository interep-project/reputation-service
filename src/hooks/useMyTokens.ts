import { useCallback, useEffect, useState } from "react";
import { getTokens } from "src/utils/frontend/api";

const useMyTokens = (
  address?: string
): { tokens: any[]; refetchTokens: () => Promise<void> } => {
  const [tokens, setTokens] = useState([]);

  const getMyTokens = useCallback(async () => {
    if (address) {
      const response = await getTokens({ ownerAddress: address });

      if (response) {
        setTokens(response.tokens);
      }
    }
  }, [address]);

  useEffect(() => {
    getMyTokens();
  }, [getMyTokens]);

  return { tokens, refetchTokens: getMyTokens };
};

export default useMyTokens;
