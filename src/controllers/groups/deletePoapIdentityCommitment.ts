import { ethers } from "ethers"
import { NextApiRequest, NextApiResponse } from "next"
import { deleteIdentityCommitment } from "src/core/groups"
import { getPoapGroupNamesByAddress, PoapGroupName } from "src/core/groups/poap"
import { Web3Provider } from "src/types/groups"
import { dbConnect } from "src/utils/backend/database"
import logger from "src/utils/backend/logger"

export default async function deletePoapIdentityCommitmentController(req: NextApiRequest, res: NextApiResponse) {
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

        const userPoapGroupNames = await getPoapGroupNamesByAddress(userAddress)

        if (!userPoapGroupNames.includes(name as PoapGroupName)) {
            throw new Error(`The address does not hold the group POAP token`)
        }

        await dbConnect()

        logger.silly(`Deleting identity commitment ${identityCommitment} to the tree of the POAP group ${name}`)

        await deleteIdentityCommitment(Web3Provider.POAP, name, identityCommitment)

        return res.status(201).send({ data: true })
    } catch (error) {
        logger.error(error)

        return res.status(500).end()
    }
}
