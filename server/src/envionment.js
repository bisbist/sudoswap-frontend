import { ethers } from 'ethers'
import config from './config.js';

export const provider = new ethers.providers.JsonRpcProvider(config.chain.rpcUrl)

export const contracts = {
    ERC20(address, signer) {
        return new ethers.Contract(address || ethers.constants.AddressZero, config.ERC20.abi, signer || provider)
    },
    ERC721(address, signer) {
        return new ethers.Contract(address || ethers.constants.AddressZero, config.ERC721.abi, signer || provider)
    },
    ERC2981(address, signer) {
        return new ethers.Contract(address || ethers.constants.AddressZero, config.ERC2981.abi, signer || provider)
    },
    Pair(address, signer) {
        return new ethers.Contract(address || ethers.constants.AddressZero, config.Pair.abi, signer || provider)
    },
    PairFactory(address, signer) {
        return new ethers.Contract(address || config.PairFactory.address, config.PairFactory.abi, signer || provider)
    },
    Router(address, signer) {
        return new ethers.Contract(address || config.Router.default.address, config.Router.default.abi, signer || provider)
    },
    RoyaltyRouter(address, signer) {
        return new ethers.Contract(address || config.Router.royalty.address, config.Router.royalty.abi, signer || provider)
    },
    RoyaltyRegistry(address, signer) {
        return new ethers.Contract(address || config.RoyaltyRegistry.address, config.RoyaltyRegistry.abi, signer || provider)
    }
}