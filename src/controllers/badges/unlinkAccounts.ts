import { OAuthAccount, Token } from "@interrep/db"
import { utils } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/client"
import { unlinkAccounts } from "src/core/badges"
import { dbConnect } from "src/utils/backend/database"
import getSigner from "src/utils/backend/getSigner"
import logger from "src/utils/backend/logger"
import capitalize from "src/utils/common/capitalize"

export default async function unlinkAccountsController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        res.status(405).end()
        return
    }

    const session = await getSession({ req })

    if (!session) {
        res.status(401).end()
        return
    }

    const { attestationMessage, attestationSignature, accountId } = JSON.parse(req.body)

    if (!attestationMessage || !attestationSignature || !accountId) {
        res.status(400).end()
        return
    }

    if (session.accountId !== accountId) {
        res.status(403).send("The account id does not match the session account id")
        return
    }

    const backendSigner = await getSigner()
    const backendSignerAddress = await backendSigner.getAddress()

    if (utils.verifyMessage(attestationMessage, attestationSignature) !== backendSignerAddress) {
        res.status(400).send("The attestation signature is not valid")
        return
    }

    try {
        await dbConnect()

        const account = await OAuthAccount.findById(accountId)

        if (!account) {
            throw new Error(`The account does not exist`)
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

        res.status(200).send({ data: true })

        logger.info(
            `[${req.url}] ${capitalize(account.provider)} account ${account.providerAccountId} has been unlinked`
        )
    } catch (err) {
        res.status(500).end()

        logger.error(err)
    }
}
