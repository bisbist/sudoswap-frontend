import mongoose, { Schema } from 'mongoose'


const BigNumberSchemaType = {
  type: Schema.Types.Long,
  transform: value => value.toString(),
}

const SwapSchema = new Schema({
  pairAddress: String,
  blockNumber: BigNumberSchemaType,
  txTimestamp: BigNumberSchemaType,
  txHash: String,
  txIndex: Number,
  logIndex: Number,
  type: String,
})

export default mongoose.model("swaps", SwapSchema)