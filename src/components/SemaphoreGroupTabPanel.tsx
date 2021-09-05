import React from "react";
import semethid from "semethid";
import { DeployedContracts } from "src/utils/crypto/deployedContracts";
import { addIdentityCommitment, checkIdentity } from "src/utils/frontend/api";
import TabPanelContent from "./TabPanelContent";

type Properties = {
  onArrowClick: (direction: -1 | 1) => void;
  reputation: string;
  web2AccountId: string;
};

export default function SemaphoreGroupTabPanel({
  onArrowClick,
  reputation,
  web2AccountId,
}: Properties): JSX.Element {
  const [_identityCommitment, setIdentityCommitment] = React.useState<string>();
  const [_idAlreadyExists, setIdAlreadyExists] = React.useState<boolean>();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_warningMessage, setWarningMessage] = React.useState<string>("");
  const [_infoMessage, setInfoMessage] = React.useState<string>("");

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

    const alreadyExist = await checkIdentity({ groupId, identityCommitment });

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

    setInfoMessage("You successfully joined the group");
    setIdAlreadyExists(true);
    setLoading(false);
  }

  async function retrieveIdentityCommitment(
    groupId: string
  ): Promise<string | null> {
    try {
      return (await semethid(groupId)).toString();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  return (
    <>
      <TabPanelContent
        title="Semaphore Group"
        description={`Create your Semaphore identity and join your TWITTER_${reputation} Semaphore group.`}
        onLeftArrowClick={onArrowClick}
        onRightArrowClick={onArrowClick}
        warningMessage={_warningMessage}
        infoMessage={_infoMessage}
        loading={_loading}
        buttonText={!_identityCommitment ? "Create Semaphore id" : "Join group"}
        onButtonClick={
          !_identityCommitment ? retrieveAndCheckIdentityCommitment : joinGroup
        }
        buttonDisabled={!!(_identityCommitment && _idAlreadyExists)}
        reputation={reputation}
        contractName={DeployedContracts.INTERREP_GROUPS}
      />
    </>
  );
}
