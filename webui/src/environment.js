import { ethers } from 'ethers'
import config from './config.js';

export const isDevEnv = process.env.DEV !== undefined;

export const getDefaultTxnParams = () => {
    // hard code gas limit to prevent gas estimation failure
    return isDevEnv ? { gasLimit: 3000000 } : {}
}

if (window.ethereum === undefined) {
    alert("Please install metamask!")
}
export const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

export const contracts = {
    ERC20(address, signer) {
        return new ethers.Contract(address, config.ERC20.abi, signer || provider)
    },
    ERC721(address, signer) {
        return new ethers.Contract(address, config.ERC721.abi, signer || provider)
    },
    ERC2981(address, signer) {
        return new ethers.Contract(address, config.ERC2981.abi, signer || provider)
    },
    pair(address, signer) {
        return new ethers.Contract(address || ethers.constants.AddressZero, config.Pair.abi, signer || provider)
    },
    factory(address, signer) {
        return new ethers.Contract(address || config.PairFactory.address, config.PairFactory.abi, signer || provider)
    },
    router(address, signer) {
        return new ethers.Contract(address || config.Router.default.address, config.Router.default.abi, signer || provider)
    },
    royaltyRouter(address, signer) {
        return new ethers.Contract(address || config.Router.royalty.address, config.Router.royalty.abi, signer || provider)
    },
    royaltyRegistry(address, signer) {
        return new ethers.Contract(address || config.RoyaltyRegistry.address, config.RoyaltyRegistry.abi, signer || provider)
    }
}

