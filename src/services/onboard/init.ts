import Onboard from "bnc-onboard";
import { API, Subscriptions } from "src/types/onboard";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";

const networkId = getDefaultNetworkId();

const wallets = [{ walletName: "metamask", preferred: true }];
const walletCheck = [
  { checkName: "derivationPath" },
  { checkName: "connect" },
  { checkName: "accounts" },
  { checkName: "network" },
];

const initOnboard = (subscriptions: Subscriptions): API =>
  Onboard({
    networkId: networkId,
    hideBranding: true,
    walletSelect: { wallets },
    walletCheck,
    subscriptions,
  });

export default initOnboard;
