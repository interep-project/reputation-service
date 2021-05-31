import { useCallback, useState } from "react";
import { ethers } from "ethers";

const useEncryption = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const getPublicKey = useCallback(async () => {
    // @ts-ignore: ignore
    await window.ethereum.enable();
    // @ts-ignore: ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    const pubKey = await provider.send("eth_getEncryptionPublicKey", [
      accounts[0],
    ]);
    setPublicKey(pubKey);

    return pubKey;
  }, []);

  const decrypt = async (messageToDecrypt: string): Promise<string> => {
    // @ts-ignore: ignore
    const decrypted = await window.ethereum.request({
      method: "eth_decrypt",
      // @ts-ignore: ignore
      params: [messageToDecrypt, window.ethereum.selectedAddress],
    });

    return decrypted;
  };

  return { getPublicKey, publicKey, decrypt };
};

export default useEncryption;
