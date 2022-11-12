import React from 'react'
import config from '../../config'
import { provider, contracts } from '../../environment'
import SwapETHForAnyNFTs from './SwapETHForAnyNFTs'

const Types = {
    swapETHForAnyNFTs: "0",
}

const initializeRouters = async (defaultRouters) => {
    const factory = contracts.factory()
    const routers = {
        default: {
            ...defaultRouters.default,
            address: config.Router.default.address,
        },
        royalty: {
            ...defaultRouters.royalty,
            address: config.Router.royalty.address,
        },
    }
    const allowed = await Promise.all([
        await factory.swapAllowed(routers.default.address),
        await factory.swapAllowed(routers.royalty.address),
    ])
    routers.default.allowed = allowed[0]
    routers.royalty.allowed = allowed[1]
    return routers
}

/**
 * 
 * @param {*} routerAddress router address to whiltelist/blacklist in factory
 * @param {*} allowed true means whitelist, false means to blacklist
 * @returns bool whether router is allowed or not after transaction
 */
const setRouterAllowed = async (routerAddress, allowed) => {

    await provider.send("eth_requestAccounts");

    const signer = provider.getSigner()

    let factory = contracts.factory()

    const owner = await factory.owner()
    if (owner != await signer.getAddress()) {
        alert(`Unauthorized. Please switch your wallet to ${owner}!`)
        return
    }

    factory = contracts.factory(null, signer)

    const txn = await factory.setRouterAllowed(routerAddress, allowed)
    await txn.wait()

    return await factory.swapAllowed(routerAddress)
}

const Swap = () => {
    const [swapType, setSwapType] = React.useState(Types.swapETHForAnyNFTs)
    const [routerName, setRouterName] = React.useState("default")
    const [routers, setRouters] = React.useState({
        default: { address: "", allowed: false, createContract: (signer) => contracts.router() },
        royalty: { address: "", allowed: false, createContract: (signer) => contracts.royaltyRouter },
    })

    React.useEffect(() => {
        initializeRouters(routers).then(setRouters)
    }, [])

    return (
        <div>
            {/* select router */}
            <div>
                <select
                    style={{ flex: 1 }}
                    value={routerName}
                    onChange={event => {
                        setRouterName(event.target.value)
                    }} >
                    {
                        Object.keys(routers).map((key, i) => {
                            return <option key={i} value={key}>{key}</option>
                        })
                    }
                </select>
                <input
                    type="checkbox"
                    checked={routers[routerName].allowed}
                    onChange={async (event) => {
                        const allowed = setRouterAllowed(
                            routers[routerName].address, event.target.checked)
                        setRouters({
                            ...routers,
                            [routerName]: { ...routers[routerName], allowed }
                        })
                    }} />
            </div>

            {/* select swap type */}
            <select
                style={{ width: '100%' }}
                value={swapType}
                onChange={event => setSwapType(event.target.value)} >
                {
                    Object.keys(Types).map((key, i) => {
                        return <option key={i} value={Types[key]}>{key}</option>
                    })
                }
            </select>

            {/* render swap component based on swap type */}
            {
                swapType == Types.swapETHForAnyNFTs ? (
                    <SwapETHForAnyNFTs router={{
                        name: routerName,
                        createContract: routers[routerName].createContract,
                    }} />
                ) : null
            }

        </div>
    )
}


export default Swap