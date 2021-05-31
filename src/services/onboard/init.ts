import Onboard from "bnc-onboard";
import { API, Subscriptions } from "src/types/onboard";
import { getDefaultNetworkId } from "src/utils/crypto/getDefaultNetwork";

const NETWORK_ID = getDefaultNetworkId();

const WALLETS = [
  { walletName: "metamask", preferred: true },
  // {
  //   walletName: "ledger",
  //   rpcUrl: publicRuntimeConfig.RPC_URL,
  //   preferred: true,
  // Need to use following transport? https://github.com/LedgerHQ/ledgerjs/blob/master/docs/migrate_webusb.md
  // LedgerTransport: TransportNodeHid
  // },
];

const walletCheck = [
  { checkName: "derivationPath" },
  { checkName: "connect" },
  { checkName: "accounts" },
  { checkName: "network" },
];

const initOnboard = (subscriptions: Subscriptions): API =>
  Onboard({
    networkId: NETWORK_ID,
    hideBranding: true,
    walletSelect: { wallets: WALLETS },
    walletCheck,
    subscriptions,
  });

export default initOnboard;
