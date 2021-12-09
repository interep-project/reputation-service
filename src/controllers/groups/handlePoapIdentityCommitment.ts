import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { appendLeaf, deleteLeaf } from "src/core/groups/mts"
import { getPoapEventsByAddress, PoapEvent } from "src/core/poap"
import { Web3Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function handlePoapIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
    const name = req.query?.name
    const identityCommitment = req.query?.identityCommitment
    const { userSignature, userAddress } = JSON.parse(req.body)

    if (
        !name ||
        typeof name !== "string" ||
        !identityCommitment ||
        typeof identityCommitment !== "string" ||
        !userSignature ||
        !userAddress
    ) {
        return res.status(400).end()
    }

    try {
        if (ethers.utils.verifyMessage(identityCommitment, userSignature) !== userAddress) {
            throw new Error(`The signature is not valid`)
        }

        const userPoapGroupNames = await getPoapEventsByAddress(userAddress)

        if (!userPoapGroupNames.includes(name as PoapEvent)) {
            throw new Error(`The address does not hold the group POAP token`)
        }

        await dbConnect()

        if (req.method === "POST") {
            await appendLeaf(Web3Provider.POAP, name, identityCommitment)
        } else if (req.method === "DELETE") {
            await deleteLeaf(Web3Provider.POAP, name, identityCommitment)
        }

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
