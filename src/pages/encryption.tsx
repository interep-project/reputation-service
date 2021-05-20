import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { encrypt } from "eth-sig-util";

function stringifiableToHex(value: unknown) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
}

const encryptMessage = (publicKey: string, message: string) =>
  stringifiableToHex(
    encrypt(publicKey, { data: message }, "x25519-xsalsa20-poly1305")
  );

const Authentication = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [encryptedMessage, setEncryptedMessage] = useState<string | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [messageToEncrypt, setMessageToEncrypt] = useState("");
  const [messageToDecrypt, setMessageToDecrypt] = useState("");

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
  }, []);

  const decrypt = async () => {
    // @ts-ignore: ignore
    const decrypted = await window.ethereum.request({
      method: "eth_decrypt",
      // @ts-ignore: ignore
      params: [messageToDecrypt, window.ethereum.selectedAddress],
    });
    setDecryptedMessage(decrypted);
  };

  return (
    <div className="break-words">
      <h1>Encryption Test</h1>
      <button
        onClick={() => {
          getPublicKey();
        }}
      >
        GET PUBLIC KEY
      </button>
      <p>Public Key: {publicKey}</p>
      {/* ********* ENCRYPT *********** */}
      <label>
        Message to encrypt:{" "}
        <input
          type="text"
          value={messageToEncrypt}
          onChange={(e) => setMessageToEncrypt(e.target.value)}
          className="border border-black"
        />
      </label>
      <button
        onClick={() => {
          const encrypted =
            publicKey && encryptMessage(publicKey, messageToEncrypt);
          setEncryptedMessage(encrypted);
        }}
      >
        ENCRYPT
      </button>
      <p>Encrypted Message: {encryptedMessage}</p>
      {/* ********* DECRYPT *********** */}
      <label>
        Message to decrypt:{" "}
        <input
          type="text"
          value={messageToDecrypt}
          onChange={(e) => setMessageToDecrypt(e.target.value)}
          className="border border-black"
        />
      </label>
      <button
        onClick={async () => {
          await decrypt();
        }}
      >
        DECRYPT
      </button>
      <p>Decrypted Message: {decryptedMessage}</p>
    </div>
  );
};

export default Authentication;
