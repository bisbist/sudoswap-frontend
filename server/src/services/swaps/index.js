
import { ethers } from 'ethers'
import config from '../../config.js';
import { provider, contracts } from "../../envionment.js"
import Swap from './schema.js'
import { Pair } from "../pairs"


const swapEventHandler = (swapType) => {
    return async (event) => {
        const pair = await Pair.findOne(event.address)
        if (pair) {
            const pc = new ethers.Contract(pair.address, config.Pair.abi, provider)
            const [
                spotPrice, ethBalance, tokenBalance,
            ] = await Promise.all([
                pc.spotPrice(),
                provider.getBalance(pair.address),
                0,
            ])

            Object.assign(pair, { spotPrice, ethBalance, tokenBalance })

            const res = await pair.save()
            console.log(res)

            const resw = await Swap.create({
                type: swapType,
                blockNumber: event.blockNumber,
                txHash: event.transactionHash,
                txIndex: event.txIndex,
                logIndex: event.logIndex,
            })
            console.log(resw)
        }
    }
}


const fetchSwapUpdates = () => {

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