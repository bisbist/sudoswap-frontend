
import { ethers } from 'ethers'
import fs from 'fs/promises';
import config from './config.js';

const provider = new ethers.providers.JsonRpcProvider(config.chain.rpcUrl)

const factoryContract = new ethers.Contract(
  config.PairFactory.address, config.PairFactory.abi, provider)

// create a mock json array db that represents a table with records
const createPairDB = async (name) => {
  try {
    await fs.stat(name)
  } catch (error) {
    if (error.code == 'ENOENT') {
      await fs.writeFile(name, JSON.stringify([]))
    }
  }
  return {
    async get(id) {
      const buf = await fs.readFile(name)
      const pairs = JSON.parse(buf.toString())
      return pairs.find(pair => {
        return pair.id = id
      })
    },
    async getAll() {
      const buf = await fs.readFile(name)
      const pairs = JSON.parse(buf.toString())
      return pairs;
    },
    async put(id, blockNumber, txHash, txIndex, logIndex, spotPrice, delta, fee, assetRecipient, bondingCurve, nft, poolType, owner) {
      const buf = await fs.readFile(name)
      const pairs = JSON.parse(buf.toString())
      const index = pairs.findIndex(pair => pair.id == id)
      if (index >= 0) { // found
        pairs[index] = { 
          id, blockNumber, txHash, txIndex, logIndex, 
          spotPrice, delta, fee, 
          assetRecipient, bondingCurve, nft, poolType, owner }
      } else {
        pairs.push({ 
          id, blockNumber, txHash, txIndex, logIndex, 
          spotPrice, delta, fee, 
          assetRecipient, bondingCurve, nft, poolType, owner })
      }
      await fs.writeFile(name, JSON.stringify(pairs, null, 2))
    },
  };
}

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
    poolType
  ] = await Promise.all([
    contract.spotPrice(),
    contract.delta(),
    contract.fee(),
    contract.assetRecipient(),
    contract.bondingCurve(),
    contract.nft(),
    contract.poolType(),
  ])

  // fetch additional information: 
  // bondingCurve, nftAddress, poolType

  // save in db with addr as primary key
  db.put(pair,
    event.blockNumber,
    event.transactionHash,
    event.transactionIndex,
    event.logIndex,
    spotPrice.toString(),
    delta.toString(),
    fee.toString(),
    assetRecipient.toString(),
    bondingCurve.toString(),
    nft.toString(),
    poolType.toString(),
    (await event.getTransaction()).from,
  )
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

export { createPairDB, fetchMissingPairs, fetchNewPairs };