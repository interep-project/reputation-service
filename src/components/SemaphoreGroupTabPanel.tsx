import { Signer } from "ethers";
import React from "react";
import semethid from "semethid";
import { DeployedContracts } from "src/utils/crypto/deployedContracts";
import {
  addIdentityCommitment,
  checkIdentityCommitment,
} from "src/utils/frontend/api";
import TabPanelContent from "./TabPanelContent";
import { poseidon, babyJub } from "circomlib";

type Properties = {
  onArrowClick: (direction: -1 | 1) => void;
  reputation: string;
  signer: Signer;
  web2AccountId: string;
};

export default function SemaphoreGroupTabPanel({
  onArrowClick,
  reputation,
  signer,
  web2AccountId,
}: Properties): JSX.Element {
  const [_identityCommitment, setIdentityCommitment] = React.useState<string>();
  const [_idAlreadyExists, setIdAlreadyExists] = React.useState<boolean>();
  const [_hasJoined, setHasJoined] = React.useState<boolean>();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_warningMessage, setWarningMessage] = React.useState<string>("");

  async function retrieveAndCheckIdentityCommitment(): Promise<void> {
    setWarningMessage("");
    setLoading(true);

    const groupId = `TWITTER_${reputation}`;

    const identityCommitment = await retrieveIdentityCommitment(groupId);

    if (!identityCommitment) {
      setWarningMessage(
        "Your signature is needed to create the identity commitment"
      );
      setLoading(false);
      return;
    }

    const alreadyExist = await checkIdentityCommitment({
      groupId,
      identityCommitment,
    });

    if (alreadyExist === null) {
      setWarningMessage("Sorry, there was an unexpected error");
      setLoading(false);
      return;
    }

    if (alreadyExist) {
      setWarningMessage("You already joined this group");
    }

    setIdentityCommitment(identityCommitment);
    setIdAlreadyExists(alreadyExist);
    setLoading(false);
  }

  async function joinGroup(): Promise<void> {
    setLoading(true);

    const groupId = `TWITTER_${reputation}`;
    const rootHash = await addIdentityCommitment({
      groupId,
      identityCommitment: _identityCommitment as string,
      web2AccountId: web2AccountId,
    });

    if (!rootHash) {
      setWarningMessage("Sorry, there was an unexpected error");
      setLoading(false);
      return;
    }

    setHasJoined(true);
    setLoading(false);
  }

  async function retrieveIdentityCommitment(
    groupId: string
  ): Promise<string | null> {
    try {
      const identity = await semethid(
        (message) => signer.signMessage(message),
        groupId
      );

      return poseidon([
        babyJub.mulPointEscalar(identity.keypair.pubKey, 8)[0],
        identity.identityNullifier,
        identity.identityTrapdoor,
      ]).toString();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return (
    <>
      <TabPanelContent
        title="Semaphore Group"
        description={
          !_hasJoined
            ? `Create your Semaphore identity and join the TWITTER_${reputation} Semaphore group.`
            : `You successfully joined the TWITTER_${reputation} Semaphore group.`
        }
        onLeftArrowClick={onArrowClick}
        onRightArrowClick={onArrowClick}
        warningMessage={_warningMessage}
        loading={_loading}
        buttonText={!_identityCommitment ? "Create identity" : "Join group"}
        onButtonClick={
          !_identityCommitment ? retrieveAndCheckIdentityCommitment : joinGroup
        }
        buttonDisabled={
          !!(_identityCommitment && _idAlreadyExists) || _hasJoined
        }
        reputation={reputation}
        contractName={DeployedContracts.INTERREP_GROUPS}
      />
    </>
  );
}
