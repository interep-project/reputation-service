import { BigNumber } from "ethers"

export default function stringToBigNumber(s: string): BigNumber {
    return BigNumber.from(s)
}
