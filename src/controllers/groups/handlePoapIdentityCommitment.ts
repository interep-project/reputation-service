import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { appendLeaf, deleteLeaf } from "src/core/groups/mts"
import { getPoapEventsByAddress, PoapEvent } from "src/core/poap"
import { Web3Provider } from "src/types/groups"
import { logger } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function handlePoapIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name as string
    const identityCommitment = req.query?.identityCommitment as string
    const { userSignature, userAddress } = JSON.parse(req.body)

    if (!userSignature || !userAddress) {
        res.status(400).end()
        return
    }

    try {
        if (ethers.utils.verifyMessage(identityCommitment, userSignature) !== userAddress) {
            throw new Error(`The signature is not valid`)
        }

        const userPoapGroupNames = await getPoapEventsByAddress(userAddress)

        if (!userPoapGroupNames.includes(name as PoapEvent)) {
            throw new Error(`The address does not hold the group POAP token`)
        }

        await connectDatabase()

        if (req.method === "POST") {
            await appendLeaf(Web3Provider.POAP, name, identityCommitment)
        } else if (req.method === "DELETE") {
            await deleteLeaf(Web3Provider.POAP, name, identityCommitment)
        }

        res.status(201).send({ data: true })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
