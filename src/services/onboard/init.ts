import Onboard from "bnc-onboard";
import { API, Subscriptions } from "src/types/onboard";

const NETWORK_ID = 42;
const WALLETS = [{ walletName: "metamask", preferred: true }];

const initOnboard = (subscriptions: Subscriptions): API =>
  Onboard({
    networkId: NETWORK_ID,
    hideBranding: true,
    walletSelect: { wallets: WALLETS },
    subscriptions,
  });

export default initOnboard;
