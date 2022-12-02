import mongoose, { Schema } from 'mongoose'

export const Type = {
    TOKEN: "0",
    NFT: "1",
    TRADE: "2",
}

export const Variant = {
    ENUMERABLE_ETH: "0",
    MISSING_ENUMERABLE_ETH: "1",
    ENUMERABLE_ERC20: "2",
    MISSING_ENUMERABLE_ERC20: "3"
}

const BigNumberSchemaType = {
    type: Schema.Types.Long,
    transform: value => value.toString(),
}

const PairSchema = new Schema({
    address: String,
    blockNumber: Number,
    logIndex: Number,
    txType: Number,
    txHash: String,
    txIndex: Number,
    timestamp: BigNumberSchemaType,
    txValue: BigNumberSchemaType,
    txNonce: BigNumberSchemaType,
    txGasLimit: BigNumberSchemaType,
    txGasPrice: BigNumberSchemaType,
    txMaxFeePerGas: BigNumberSchemaType,
    txMaxPriorityFeePerGas: BigNumberSchemaType,
    spotPrice: BigNumberSchemaType,
    delta: BigNumberSchemaType,
    fee: BigNumberSchemaType,
    owner: String,
    assetRecipient: String,
    nft: String,
    bondingCurve: String,
    token: String,
    poolType: {
        type: String,
        enum: [
            Type.TOKEN,
            Type.NFT,
            Type.TRADE,
        ]
    },
    variant: {
        type: String,
        enum: [
            Variant.ENUMERABLE_ETH,
            Variant.MISSING_ENUMERABLE_ETH,
            Variant.ENUMERABLE_ERC20,
            Variant.MISSING_ENUMERABLE_ERC20,
        ]
    },
    ethBalance: BigNumberSchemaType,
    tokenBalance: BigNumberSchemaType,
})

export default mongoose.model("pairs", PairSchema);