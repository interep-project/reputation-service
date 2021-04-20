/* eslint no-console: 0 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ethers, providers } from "ethers";
import { API, Wallet } from "src/types/onboard";
import initOnboard from "../onboard/init";

export interface Web3State {
  address?: string;
  networkId?: number;
  connect?: () => Promise<void>;
  connected?: boolean;
}

const Web3Context = createContext<Web3State>({} as never);

const SELECTED_WALLET_KEY = "selectedWallet";

export const Web3ContextProvider: React.FC = ({ children }) => {
  const [onboard, setOnboard] = useState<API | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [networkId, setNetworkId] = useState<number | undefined>(undefined);
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [connected, setConnected] = useState<boolean | undefined>(undefined);
  const [provider, setProvider] = useState<providers.Web3Provider | undefined>(
    undefined
  );

  const resetAll = useCallback(() => {
    window.localStorage.removeItem(SELECTED_WALLET_KEY);
    setWallet(undefined);
    setProvider(undefined);
    setConnected(false);
  }, []);

  useEffect(() => {
    const newOnboard = initOnboard({
      address: (account: string) => {
        console.debug(`[Onboard] Account change:`, account);
        if (account === undefined) {
          resetAll();
          onboard && onboard.walletReset();
        } else {
          setAddress(account);
          setConnected(true);
        }
      },
      wallet: (wallet: Wallet) => {
        console.debug(`[Onboard] Wallet change:`, wallet);
        if (wallet.provider) {
          setWallet(wallet);
          const ethersProvider = new ethers.providers.Web3Provider(
            wallet.provider
          );
          setProvider(ethersProvider);

          if (wallet?.name) {
            // set the selectedWallet value in local storage
            window.localStorage.setItem(SELECTED_WALLET_KEY, wallet.name);
          } else {
            window.localStorage.removeItem(SELECTED_WALLET_KEY);
          }
        } else {
          resetAll();
          onboard?.walletReset();
        }
      },
      network: (newNetworkId) => {
        console.debug(`[Onboard] New network id: `, newNetworkId);

        if (newNetworkId) {
          try {
            onboard?.walletCheck();
          } catch (err) {
            console.error(err);
          }
          setNetworkId(newNetworkId);
        }
      },
    });

    setOnboard(newOnboard);
  }, [resetAll]);

  useEffect(() => {
    const setPreviouslySelectedWallet = async () => {
      // get the selectedWallet value from local storage
      const previouslySelectedWallet = window.localStorage.getItem(
        "selectedWallet"
      );

      // call wallet select with that value if it exists
      if (previouslySelectedWallet != null && onboard) {
        await onboard.walletSelect(previouslySelectedWallet);
      }
    };
    setPreviouslySelectedWallet();
  }, [onboard]);

  const connect = useCallback(async () => {
    if (!onboard) {
      console.error("Onboard is not initialized yet");
      return;
    }

    const hasSelectedAWallet = await onboard.walletSelect();

    if (!hasSelectedAWallet) {
      console.info("User exited wallet modal");
    }

    let checkPassed = false;
    try {
      checkPassed = await onboard.walletCheck();
    } catch (error) {
      console.error(error);
    }

    if (checkPassed) {
      console.log(`Setting connected from connect`);
      setConnected(true);
    } else {
      resetAll();
      onboard.walletReset();
      alert("Unable to connect wallet");
    }
  }, [onboard, resetAll]);

  const contextValue = useMemo(
    () => ({ address, networkId, wallet, provider, connect, connected }),
    [address, connect, connected, networkId, provider, wallet]
  );

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};

export const useWeb3Context = () => useContext(Web3Context);
