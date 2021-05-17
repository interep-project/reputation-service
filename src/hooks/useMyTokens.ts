import { useCallback, useEffect, useState } from "react";

const useMyTokens = (address?: string): { tokens: any[] } => {
  const [tokens, setTokens] = useState([]);

  const getMyTokens = useCallback(async (address: string) => {
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
  }, []);

  useEffect(() => {
    address && getMyTokens(address);
  }, [address, getMyTokens]);

  return { tokens };
};

export default useMyTokens;
