
import { ethers } from 'ethers'
import config from '../config.js';
import { provider, pairContract } from "../envionment.js"

const fetchSwapDetailsAndSave = async (db, event) => {
    await db.put(`${event.blockNumber}_${event.transactionIndex}_${event.logIndex}`, {
        pairId: event.address,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        txIndex: event.transactionIndex,
        logIndex: 1,
        type: "SwapNFTInPair",
    })
}


// event SwapNFTInPair(); 
// event SwapNFTOutPair(); 
// event SpotPriceUpdate(uint128 newSpotPrice); 
// event TokenDeposit(uint256 amount); 
// event TokenWithdrawal(uint256 amount); 
// event NFTWithdrawal(); 
// event DeltaUpdate(uint128 newDelta); 
// event FeeUpdate(uint96 newFee); 
// event AssetRecipientChange(address a); 
const pairEventCallbacks = [
    {
        filter: pairContract.filters.SwapNFTInPair(), // token balance, spotPrice
        callback: async (event, args) => {
            const { pairDB, swapDB } = args
            const pair = await pairDB.get(event.address)
            if (pair) {
                const pc = new ethers.Contract(pair.id, config.Pair.abi, provider)
                const [
                    spotPrice,
                    ethBalance,
                    tokenBalance,
                ] = await Promise.all([
                    pc.spotPrice(),
                    provider.getBalance(pair.id),
                    0,
                ])
                await pairDB.put(pair.id, {
                    ...pair,
                    spotPrice: spotPrice.toString(),
                    ethBalance: ethBalance.toString(),
                    tokenBalance,
                })
                await fetchSwapDetailsAndSave(swapDB, event)
                console.log(event)
            }
        },
    }, {
        filter: pairContract.filters.SwapNFTOutPair(), // nft balance, spotPrice
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.SpotPriceUpdate(null), // spotPrice
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.TokenDeposit(null), // token balance
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.TokenWithdrawal(null), // token balance
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.NFTWithdrawal(), // nft balance
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.DeltaUpdate(null), // delta
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.FeeUpdate(null), // fee
        callback: async (event, args) => {

        },
    }, {
        filter: pairContract.filters.AssetRecipientChange(null),  // assetRecipient
        callback: async (event, args) => {

        },
    },
]

// fetch existing Swap events from blockchain
const fetchMissingSwaps = async (db) => {
    // fetch latest pair block number from db
    const swaps = await db.getAll()
    const latestBlockNumber = swaps.reduce((max, swap) => {
        return swap.blockNumber > max ? swap.blockNumber : max
    }, 1)

    const existingSwaps = []
    // pairEventCallbacks.forEach(ecb => {
    //   provider.getLogs({...ecb.filter, address: null })
    // })

    existingSwaps.forEach(async (event) => {
        await fetchSwapDetailsAndSave(db, event)
    })
}

const fetchPairUpdates = (pairDB, swapDB) => {
    pairEventCallbacks.forEach(ecb => {
        provider.on({ ...ecb.filter, address: null }, (...events) => {
            events.forEach(event => {
                if (pairDB.get(event.address)) {
                    const ecb = pairEventCallbacks.find(ecb => {
                        return ecb.filter.topics[0] == event.topics[0]
                    })
                    ecb.callback(event, { pairDB, swapDB })
                }
            })
        })
    })

}


export { fetchPairUpdates };