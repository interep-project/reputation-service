import { OAuthAccount, Token } from "@interrep/db"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { unlinkAccounts } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import getSigner from "src/utils/backend/getSigner"
import logger from "src/utils/backend/logger"

export default async function unlinkAccountsController(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "PUT") {
        return res.status(405).end()
    }

    const session = await getSession({ req })

    if (!session) {
        return res.status(401).end()
    }

    const { attestationMessage, attestationSignature, accountId } = JSON.parse(req.body)

    if (!attestationMessage || !attestationSignature || !accountId) {
        return res.status(400).end()
    }

    if (session.accountId !== accountId) {
        return res.status(403).send("The account id does not match the session account id")
    }

    const backendSigner = await getSigner()
    const backendSignerAddress = await backendSigner.getAddress()

    if (utils.verifyMessage(attestationMessage, attestationSignature) !== backendSignerAddress) {
        return res.status(400).send("The attestation signature is not valid")
    }

    try {
        await dbConnect()

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`The account id does not match any account in the db`)
        }

        const [tokenId, , provider, providerAccountId] = JSON.parse(attestationMessage)

        const accountFromAttestation = await OAuthAccount.findByProviderAccountId(provider, providerAccountId)

        if (!accountFromAttestation || accountFromAttestation.providerAccountId !== account.providerAccountId) {
            throw new Error("The account does not match the attestation account")
        }

        const token = await Token.findOne({ tokenId })

        if (!token) {
            throw new Error("The attestation token does not exist")
        }

        await unlinkAccounts(account, token)

        return res.status(200).send({ data: true })
    } catch (err) {
        logger.error(err)

        return res.status(500).end()
    }
}
