import { provider, contracts } from "../../envionment.js"
import Swap from './schema.js'
import { Pair } from "../pairs/index.js"
import { Variant } from '../pairs/schema.js';


// TODO: not working!
// fetch existing swap events from blockchain
const fetchMissingSwaps = async () => {
    const swaps = await Swap.find().sort({ blockNumber: -1 }).limit(1)

    const blockNumber = Math.max(
        swaps.length > 0 ? swaps[0].blockNumber : 0, await provider.getBlockNumber() - 2500) // - 3015)

    const pairContract = contracts.Pair()

    // SwapNFTOutPair
    const [swapNFTInPairEvents, swapNFTOutPairEvents] = await Promise.all([
        provider.getLogs({ ...pairContract.filters.SwapNFTInPair(), address: null }),
        provider.getLogs({ ...pairContract.filters.SwapNFTOutPair(), address: null }),
    ])

    console.log(swapNFTInPairEvents, swapNFTOutPairEvents)

    const handleSwapNFTInPair = swapEventHandler("SwapNFTInPair")
    const handleSwapNFTOutPair = swapEventHandler("SwapNFTOutPair")

    for (let event of swapNFTInPairEvents) {
        await handleSwapNFTInPair(event)
    }

    for (let event of swapNFTOutPairEvents) {
        await handleSwapNFTOutPair(event)
    }

}

const swapEventHandler = (swapType) => {
    return async (event) => {
        const pair = await Pair.findOne({ address: event.address })
        if (pair) {

            const { blockNumber, txIndex, 
                logIndex, transactionHash: txHash } = event
            
            const [
                ethBalance, tokenBalance,
            ] = await Promise.all([
                provider.getBalance(pair.address),
                [Variant.ENUMERABLE_ERC20, Variant.MISSING_ENUMERABLE_ERC20].includes(pair.variant) ?
                    contracts.ERC20(pair.token).balanceOf(pair.address) :
                    0,
                
            ])

            Object.assign(pair, { ethBalance, tokenBalance })

            await pair.save()
            await Swap.create({
                type: swapType,
                blockNumber,
                txHash,
                txIndex,
                logIndex,
            })
        }
    }
}


const fetchSwapUpdates = () => {
    fetchMissingSwaps()

    const pairContract = contracts.Pair()

    const eventHandlers = [{
        filter: pairContract.filters.SwapNFTInPair(), // token balance, spotPrice
        handle: swapEventHandler("SwapNFTInPair"),
    },
    {
        filter: pairContract.filters.SwapNFTOutPair(), // nft balance, spotPrice
        handle: swapEventHandler("SwapNFTOutPair"),
    }]

    eventHandlers.forEach(evh => {
        provider.on({ ...evh.filter, address: null }, async (...events) => {
            await Promise.all(
                events.map(async event => {
                    const pair = await Pair.findOne({ address: event.address })
                    const evh = eventHandlers.find(ecb => {
                        return ecb.filter.topics[0] == event.topics[0]
                    })
                    if (!!pair && !!evh)
                        return await evh.handle(event)
                }))
        })
    })
}


export { Swap, fetchSwapUpdates };