import React, { useEffect, useState } from "react";
import {
  DeployedContracts as DeployedContractsEnum,
  getDeployedContractAddress,
} from "src/utils/crypto/deployedContracts";
import {
  getDefaultNetworkId,
  getDefaultNetworkName,
} from "src/utils/crypto/getDefaultNetwork";
import {
  ExplorerDataType,
  getExplorerLink,
} from "src/utils/frontend/getExplorerLink";

const DeployedContractSection = () => {
  const networkName = getDefaultNetworkName();
  const networkId = getDefaultNetworkId();
  const [twitterContractAddress, setTwitterContractAddress] = useState("");

  useEffect(() => {
    const address = getDeployedContractAddress(
      DeployedContractsEnum.TWITTER_BADGE
    );
    if (address) {
      setTwitterContractAddress(address);
    } else {
      console.error(`Can't get address of deployed Twitter badge`);
    }
  }, []);

  return (
    <div className="mt-8 text-white text-sm text-center">
      <span>{`Twitter Badge's address (${networkName}): `}</span>
      <a
        href={getExplorerLink(
          networkId,
          twitterContractAddress,
          ExplorerDataType.TOKEN
        )}
        target="_blank"
        rel="noreferrer"
        className="underline"
      >
        {twitterContractAddress}
      </a>
    </div>
  );
};

export default DeployedContractSection;
