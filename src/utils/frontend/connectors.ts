/* istanbul ignore file */
import { InjectedConnector } from "@web3-react/injected-connector"

export const injectedConnector = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] })
