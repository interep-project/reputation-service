import { getBrightIdLink } from "src/services/onchain/brightid";

export default async function getBrightIdByAddress(ethereumAddress: string) {
    const link = await getBrightIdLink(ethereumAddress)

    return link
}