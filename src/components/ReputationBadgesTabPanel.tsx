import TwitterIcon from "@material-ui/icons/Twitter";
import ReputationBadge from "contracts/artifacts/contracts/ReputationBadge.sol/ReputationBadge.json";
import { ethers, Signer } from "ethers";
import React, { useEffect } from "react";
import { createUserAttestationMessage } from "src/core/signing/createUserAttestationMessage";
import useEncryption from "src/hooks/useEncryption";
import { BasicReputation } from "src/models/web2Accounts/Web2Account.types";
import { getChecksummedAddress } from "src/utils/crypto/address";
import { getBadgeAddressByProvider } from "src/utils/crypto/deployedContracts";
import {
  checkLink,
  getMyTokens,
  linkAccounts,
  mintToken,
  unlinkAccounts,
} from "src/utils/frontend/api";
import TabPanelContent from "./TabPanelContent";

type Properties = {
  onArrowClick: (direction: -1 | 1) => void;
  reputation: string;
  networkId: number;
  address: string;
  signer: Signer;
  web2AccountId: string;
};

export default function ReputationBadgesTabPanel({
  onArrowClick,
  reputation,
  networkId,
  address,
  signer,
  web2AccountId,
}: Properties): JSX.Element {
  const { getPublicKey, decrypt } = useEncryption();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_message, setMessage] = React.useState<string>("");
  const [_accountLinked, setAccountLinked] = React.useState<boolean>();
  const [_token, setToken] = React.useState<any>();

  useEffect(() => {
    (async () => {
      if (reputation !== BasicReputation.CONFIRMED) {
        setMessage(
          "Sorry, you can create a badge only if your reputation is CONFIRMED"
        );
        return;
      }

      setLoading(true);

      const accountLinked = await checkLink();

      if (accountLinked === null) {
        setMessage("Sorry, there was an unexpected error");
        setLoading(false);
        return;
      }

      if (accountLinked) {
        setMessage("It seems you already have a linked account");

        const tokens = await getMyTokens({ ownerAddress: address });

        setToken(tokens[tokens.length - 1]);
      }

      setAccountLinked(accountLinked);
      setLoading(false);
    })();
  }, [reputation, address]);

  async function mint(token: any): Promise<void> {
    setLoading(true);

    const response = await mintToken({ tokenId: token._id });

    if (response === null) {
      setMessage("Sorry, there was an unexpected error");
      setLoading(false);
      return;
    }

    const tokens = await getMyTokens({ ownerAddress: address });

    setToken(tokens[tokens.length - 1]);
    setLoading(false);
  }

  async function burn(token: any): Promise<void> {
    setLoading(true);

    const badgeAddress = getBadgeAddressByProvider(token.web2Provider);

    if (badgeAddress === null) {
      setMessage("Cannot retrieve the badge's address");
      return;
    }

    const badge = new ethers.Contract(badgeAddress, ReputationBadge.abi);
    const tx = await badge.connect(signer).burn(token.decimalId);

    await tx.wait();

    const tokens = await getMyTokens({ ownerAddress: address });

    setToken(tokens[tokens.length - 1]);
    setLoading(false);
  }

  async function unlinkAccount(token: any): Promise<void> {
    setLoading(true);

    const decryptedAttestation = await decrypt(token.encryptedAttestation);
    const response = await unlinkAccounts({ decryptedAttestation });

    if (response === null) {
      setMessage("Cannot retrieve the badge's address");
      return;
    }

    setAccountLinked(false);
    setLoading(false);
  }

  async function linkAccount(): Promise<void> {
    const checksummedAddress = getChecksummedAddress(address);

    if (!checksummedAddress) {
      setMessage("Sorry, the address is not valid");
      return;
    }

    const publicKey = await getPublicKey();

    if (!publicKey) {
      setMessage("Public key is needed to link accounts");
      return;
    }

    const message = createUserAttestationMessage({
      checksummedAddress,
      web2AccountId,
    });

    const userSignature = await signer.signMessage(message);

    if (!userSignature) {
      setMessage(
        "Your signature is needed to register your intent to link the accounts"
      );
      return;
    }

    const token = await linkAccounts({
      chainId: networkId,
      address,
      web2AccountId,
      userSignature,
      userPublicKey: publicKey,
    });

    if (token) {
      setMessage("Success");
      setAccountLinked(true);
      setToken(token);
    } else {
      setMessage("Sorry there was an error while linking your accounts.");
    }
  }

  return (
    <>
      <TabPanelContent
        title="Reputation badges"
        description="Link your Web2 account with your Ethereum address and mint your badge to prove your reputation."
        onLeftArrowClick={onArrowClick}
        message={_message}
        loading={_loading}
        buttonText={
          !_accountLinked || _loading
            ? "Link your accounts"
            : _token.status === "NOT_MINTED"
            ? "Mint token"
            : _token.status === "MINTED"
            ? "Burn token"
            : "Unlink your accounts"
        }
        onButtonClick={() =>
          !_accountLinked || _loading
            ? linkAccount()
            : _token.status === "NOT_MINTED"
            ? mint(_token)
            : _token.status === "MINTED"
            ? burn(_token)
            : unlinkAccount(_token)
        }
        buttonDisabled={reputation !== BasicReputation.CONFIRMED || _loading}
      >
        {_token && _token.status === "MINTED" && (
          <div>
            <TwitterIcon style={{ color: "#D4D08E" }} fontSize="large" />
          </div>
        )}
      </TabPanelContent>
    </>
  );
}
