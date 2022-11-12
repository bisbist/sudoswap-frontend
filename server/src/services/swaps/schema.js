import mongoose, { Schema } from 'mongoose'

const SwapSchema = new Schema({
  pairAddress: Schema.Types.ObjectId,
  blockNumber: Schema.Types.Long,
  txHash: String,
  txIndex: Number,
  logIndex: Schema.Types.Number,
  type: String,
})

export default mongoose.model("swaps", SwapSchema)