import { ethers } from 'ethers'
import config from '../config.js';
import { provider, factoryContract } from '../envionment.js';


// insert pool information in db
const fetchPairDetailsAndSave = async (db, event) => {
  const pair = event.args.poolAddress;

  const contract = new ethers.Contract(pair, config.Pair.abi, provider);

  // fetch default parameters
  const [
    spotPrice,
    delta,
    fee,
    assetRecipient,
    bondingCurve,
    nft,
    poolType,
    { from: owner },
    ethBalance,
    tokenBalance,
  ] = await Promise.all([
    contract.spotPrice(),
    contract.delta(),
    contract.fee(),
    contract.assetRecipient(),
    contract.bondingCurve(),
    contract.nft(),
    contract.poolType(),
    event.getTransaction(),
    provider.getBalance(pair),
    0,
  ])

  // fetch additional information: 
  // bondingCurve, nftAddress, poolType

  // save in db with addr as primary key
  db.put(pair, {
    blockNumber: event.blockNumber,
    txHash: event.transactionHash,
    txIndex: event.transactionIndex,
    logIndex: event.logIndex,
    spotPrice: spotPrice.toString(),
    delta: delta.toString(),
    fee: fee.toString(),
    assetRecipient: assetRecipient.toString(),
    bondingCurve: bondingCurve.toString(),
    nft: nft.toString(),
    poolType: poolType.toString(),
    owner: owner,
    ethBalance: ethBalance.toString(),
    tokenBalance: tokenBalance,
  })
}



// fetch existing NewPair events from blockchain
const fetchMissingPairs = async (db) => {
  // fetch latest pair block number from db
  const pairs = await db.getAll()
  const lastestPairBlockNumber = pairs.reduce((max, pair) => {
    return pair.blockNumber > max ? pair.blockNumber : max
  }, 1)

  const existingPairs = await factoryContract.queryFilter(
    factoryContract.filters.NewPair(),
    lastestPairBlockNumber, // factoryContract.deployTransaction.blockNumber,
    null
  )

  existingPairs.forEach(async (event) => {
    await fetchPairDetailsAndSave(db, event)
  })
}

// fetch new NewPair events from blockchain
const fetchNewPairs = (db) => {
  factoryContract.on(
    factoryContract.filters.NewPair(), // on NewPair event

    async (pair, event) => {
      await fetchPairDetailsAndSave(db, event)
    })
}


export { fetchMissingPairs, fetchNewPairs };