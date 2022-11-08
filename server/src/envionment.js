import { ethers } from 'ethers'
import config from './config.js';

export const provider = new ethers.providers.JsonRpcProvider(config.chain.rpcUrl)

export const factoryContract = new ethers.Contract(
    config.PairFactory.address, config.PairFactory.abi, provider)

export const pairContract = new ethers.Contract(
    ethers.constants.AddressZero, config.Pair.abi, provider)