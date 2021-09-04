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

export default function SemaphoreGroupsTabPanel({
  onArrowClick,
  reputation,
  web2AccountId,
}: Properties): JSX.Element {
  const [_identityCommitment, setIdentityCommitment] = React.useState<string>();
  const [_idAlreadyExists, setIdAlreadyExists] = React.useState<boolean>();
  const [_loading, setLoading] = React.useState<boolean>(false);
  const [_message, setMessage] = React.useState<string>("");

  async function createSemaphoreIdentity(): Promise<void> {
    setLoading(true);

    const groupId = `TWITTER_${reputation}`;
    const identityCommitment = (await semethid(groupId)).toString();
    const alreadyExist = await checkIdentity({ groupId, identityCommitment });

    if (alreadyExist === null) {
      setMessage("Sorry, there was an unexpected error");
      setLoading(false);
      return;
    }

    if (alreadyExist) {
      setMessage("You already joined this group");
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

    if (rootHash) {
      setMessage("You joined the group with success");
    } else {
      setMessage("Sorry, there was an unexpected error");
    }

    setLoading(false);
    setIdAlreadyExists(true);
  }

  return (
    <>
      <TabPanelContent
        title="Semaphore Groups"
        description={`Create your Semaphore identity and join your TWITTER_${reputation} Semaphore group.`}
        onLeftArrowClick={onArrowClick}
        onRightArrowClick={onArrowClick}
        message={_message}
        loading={_loading}
        buttonText={!_identityCommitment ? "Create Semaphore id" : "Join group"}
        onButtonClick={
          !_identityCommitment ? createSemaphoreIdentity : joinGroup
        }
        buttonDisabled={!!(_identityCommitment && _idAlreadyExists)}
        reputation={reputation}
        contractName={DeployedContracts.INTERREP_GROUPS}
      />
    </>
  );
}
