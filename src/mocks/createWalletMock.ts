import { Wallet } from "ethers"

export default function createWalletMock(): Wallet {
    return Wallet.fromMnemonic("test test test test test test test test test test test junk")
}
