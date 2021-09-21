import { Web2Provider } from "@interrep/reputation-criteria"
import { Model, Document } from "mongoose"
import { ITransaction } from "../transactions/Transaction.types"
import { findByUserAddress } from "./Token.statics"

export enum TokenStatus {
    NOT_MINTED = "NOT_MINTED",
    MINT_PENDING = "MINT_PENDING",
    MINTED = "MINTED",
    BURN_PENDING = "BURN_PENDING",
    BURNED = "BURNED",
    REVOKED = "REVOKED"
}

export interface IToken {
    chainId: number
    contractAddress: string
    userAddress: string
    encryptedAttestation: string
    issuanceTimestamp: number
    decimalId: string
    status: TokenStatus
    mintTransactions?: ITransaction[]
    web2Provider: Web2Provider
}

export interface ITokenDocument extends IToken, Document {}

export interface ITokenModel extends Model<ITokenDocument> {
    findByUserAddress: typeof findByUserAddress
}
