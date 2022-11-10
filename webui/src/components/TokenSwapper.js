import React from 'react';
import { ethers } from 'ethers';
import config from '../config';
import AddressInput from "./utils/AddressInput.js"
import BalanceInput from "./utils/BalanceInput.js"
import { contracts, provider } from '../environment';
import ArrayInput from './utils/ArrayInput';



const getOwners = async (nft) => {
    return await Promise.all(
        Array.from(new Array(100)).map(async (_, i) => {
            return await contracts.ERC721(nft).ownerOf(i)
        }))
}

const sendNFTs = async (nft, ids, to) => {
    const accounts = await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()

    const erc721 = contracts.ERC721(nft, signer)

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        const txn = await erc721.transferFrom(signerAddress, to, id)
        await txn.wait()
    }
}

const setApprovalToOperator = async (nft, ids, operator, signer) => {
    if (ids.length > 0) {
        const signerAddress = await signer.getAddress()

        // allow operator contract to access all nft ids
        const erc721 = contracts.ERC721(nft, signer)

        // don't allow nfts that's not owned by signer
        const ownerships = await Promise.all(
            ids.map(async nftId => ({
                nftId,
                owner: await erc721.ownerOf(nftId),
            })))
        const ownedNFTIDs = ownerships
            .filter(ownership => ownership.owner == signerAddress)
            .map(ownership => ownership.nftId)

        const notOwnedNFTIDs = ids.filter(nftId => !ownedNFTIDs.find(id => id == nftId))

        if (notOwnedNFTIDs.length > 0) {
            alert(`Please remove from initial NFTs list! You don't own following NFTs: ${notOwnedNFTIDs}`)
            return
        }

        if (!await erc721.isApprovedForAll(signerAddress, operator)) {

            // get list of nft ids that are not approved to operator address
            const approvals = await Promise.all(
                ownedNFTIDs.map(async nftId => ({
                    nftId,
                    operator: await erc721.getApproved(nftId),
                }))
            )
            const nftIdsToApprove = approvals.filter(approval =>
                approval.operator != operator
            ).map(approval => approval.nftId)

            console.log("approvals:", approvals)
            console.log("nftIdsToApprove:", nftIdsToApprove)

            for (let i = 0; i < nftIdsToApprove.length; i++) {
                const nftId = nftIdsToApprove[i]
                let txn = await erc721.approve(operator, nftId)
                await txn.wait()
            }

        }

    }
}


const SwapTypes = {
    swapETHForAnyNFTs: "0",
    swapETHForSpecificNFTs: "1",
    swapNFTsForAnyNFTsThroughETH: "2",
    swapNFTsForSpecificNFTsThroughETH: "3",
    swapNFTsForToken: "4",
    // ...
}



export default ({
    selectedPair,
}) => {
    const [state, setState] = React.useState({
        selectedRouter: "default",
        routers: {
            default: { address: "", allowed: false, },
            royalty: { address: "", allowed: false, },
        },
        swapType: SwapTypes.swapNFTsForToken,
        minOutput: "0",
        deadline: "10",
        nftRecipient: "",
        tokenAmount: "0",
        tokenRecipient: "",
        swap: {
            pair: "",
            nftIds: [],
            numItems: "0"
        },
        // optional setApprovalForAll vs Specific NFT approval, set true for large number of nfts in initialNFTIDs
        setApprovalForAll: false
    })

    React.useEffect(() => {
        setState({ ...state, swap: { ...state.swap, pair: selectedPair } })
    }, [selectedPair])

    React.useEffect(() => {
        (async () => {
            const factory = contracts.factory()
            const routers = {
                default: {
                    address: config.Router.default.address,
                },
                royalty: {
                    address: config.Router.royalty.address,
                },
            }
            const allowed = await Promise.all([
                await factory.swapAllowed(routers.default.address),
                await factory.swapAllowed(routers.royalty.address),
            ])
            routers.default.allowed = allowed[0]
            routers.royalty.allowed = allowed[1]

            setState({ ...state, routers })
        })()
    }, [])


    // swap nfts for token
    return (
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <span style={{ flex: 1 }} />
            <div style={{ border: 'solid', borderWidth: 1, padding: 10, borderRadius: 5 }}>
                <table style={{ margin: 5, minWidth: 500 }}>
                    <thead>
                        <tr>
                            <th style={{ width: "30%" }} />
                            <th style={{ width: "70%" }} />
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Router</td>
                            <td style={{ display: 'flex', flexDirection: 'row' }}>
                                <select
                                    style={{ flex: 1 }}
                                    value={state.selectedRouter}
                                    onChange={event => {
                                        setState({ ...state, selectedRouter: event.target.value })
                                    }} >
                                    <option value="default">Default</option>
                                    <option value="royalty">Royalty</option>
                                </select>
                                <input
                                    type="checkbox"
                                    checked={state.routers[state.selectedRouter].allowed}
                                    onChange={async (event) => {
                                        let allowed = event.target.checked
                                        const router = state.routers[state.selectedRouter]

                                        await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site

                                        const signer = provider.getSigner()

                                        let factory = contracts.factory()

                                        const owner = await factory.owner()
                                        if (owner != await signer.getAddress()) {
                                            alert(`Unauthorized. Please switch your wallet to ${owner}!`)
                                            return
                                        }

                                        factory = contracts.factory(null, signer)

                                        const txn = await factory.setRouterAllowed(router.address, allowed)
                                        await txn.wait()

                                        setState({
                                            ...state,
                                            routers: {
                                                ...state.routers,
                                                [state.selectedRouter]: {
                                                    ...state.routers[state.selectedRouter],
                                                    allowed: await factory.swapAllowed(router.address),
                                                }
                                            }
                                        })
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Swap Type</td>
                            <td>
                                <select
                                    style={{ width: '100%' }}
                                    value={state.swapType}
                                    onChange={event => {
                                        setState({ ...state, swapType: event.target.value })
                                    }} >
                                    {
                                        Object.keys(SwapTypes).map((type, i) => {
                                            return <option key={i} value={SwapTypes[type]}>{type}</option>
                                        })
                                    }
                                </select>
                            </td>
                        </tr>

                        {
                            state.swapType == SwapTypes.swapNFTsForToken ? (
                                <BalanceInput
                                    name="Minimum Output"
                                    value={state.minOutput}
                                    onChange={minOutput => setState({ ...state, minOutput })} />
                            ) : null
                        }

                        <AddressInput
                            name='NFT Recipient'
                            address={state.nftRecipient}
                            onChange={nftRecipient => setState({ ...state, nftRecipient })} />

                        <AddressInput
                            name='Token Recipient'
                            address={state.tokenRecipient}
                            onChange={tokenRecipient => setState({ ...state, tokenRecipient })} />
                        {
                            state.swapType == SwapTypes.swapETHForSpecificNFTs ? (
                                <BalanceInput
                                    name="Token Amount"
                                    value={state.tokenAmount}
                                    onChange={tokenAmount => setState({ ...state, tokenAmount })} />
                            ) : null
                        }

                        <BalanceInput
                            name="Deadline"
                            value={state.deadline}
                            onChange={deadline => setState({ ...state, deadline })} />

                        <AddressInput
                            name='Pair'
                            address={state.swap.pair}
                            onChange={pair => setState({ ...state, swap: { ...state.swap, pair } })} />

                        {
                            state.swapType == SwapTypes.swapNFTsForToken ||
                                state.swapType == SwapTypes.swapETHForSpecificNFTs ? (
                                <ArrayInput
                                    name="NFT IDs"
                                    values={state.swap.nftIds}
                                    onValuesChange={values => {
                                        setState({
                                            ...state,
                                            swap: {
                                                ...state.swap,
                                                nftIds: values,
                                            }
                                        })
                                    }}
                                    checkboxTitle="SetApprovalForAll"
                                    checkboxSelected={state.setApprovalForAll}
                                    onCheckboxClick={() => {
                                        setState({
                                            ...state,
                                            setApprovalForAll: !state.setApprovalForAll,
                                        })
                                    }} />
                            ) : null
                        }



                    </tbody>
                </table>
                <div style={{ textAlign: 'center' }}>
                    <button
                        style={{ margin: 5 }}
                        onClick={async (event) => {
                            // console.log(await contracts.factory().protocolFeeRecipient())
                            // console.log(await contracts.factory().protocolFeeMultiplier())
                            // return
                            // await sendNFTs(
                            //     "0xA50c218C73B0b087d4492587bCF104Ab786b2150",
                            //     [45, 46, 47, 48, 49],
                            //     "0xD96D3D8a3a35552b297Da318248CC0B6676c335a"
                            // )
                            // return

                            await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                            const signer = provider.getSigner()

                            let router
                            switch (state.selectedRouter) {
                                case "default":
                                    router = contracts.router(null, signer)
                                    break;
                                case "royalty":
                                    router = contracts.royaltyRouter(null, signer)
                                    break
                                default:
                                    alert(`Invalid Router ${state.selectedRouter}`)
                                    return
                            }

                            let deadline = Date.now() + Math.floor(1000 * parseFloat(state.deadline))

                            const nft = await contracts.pair(state.swap.pair).nft()

                            // console.log(router.filters.RoyaltyIssued())
                            // const lookupAddress = await contracts.royaltyRegistry().getRoyaltyLookupAddress(nft)
                            // console.log(lookupAddress)
                            // const supportsInterface = await contracts.ERC2981(lookupAddress).supportsInterface("0x2a55205a")
                            // console.log(supportsInterface)
                            // return

                            // console.log(await getOwners(nft))
                            // console.log(router.address)
                            // return



                            let txn

                            switch (state.swapType) {

                                case SwapTypes.swapNFTsForToken:
                                case SwapTypes.swapETHForSpecificNFTs:

                                    let tokenRecipient = state.tokenRecipient
                                    if (state.tokenRecipient == "") {
                                        tokenRecipient = await signer.getAddress()
                                    }

                                    const nftIds = state.swap.nftIds.filter(v => v.trim() != "")
                                    if (nftIds.length < 1) {
                                        alert("Please specify NFT IDs!")
                                        return
                                    }

                                    const swapList = [
                                        [state.swap.pair, nftIds]
                                    ]

                                    switch (state.swapType) {
                                        case SwapTypes.swapNFTsForToken:

                                            await setApprovalToOperator(nft, nftIds, router.address, signer)
                                            txn = await router.swapNFTsForToken(
                                                swapList,
                                                ethers.utils.parseEther(state.minOutput),
                                                tokenRecipient,
                                                deadline,
                                                {
                                                    gasLimit: 30000000,
                                                }
                                            )
                                            break

                                        case SwapTypes.swapETHForSpecificNFTs:

                                            let nftRecipient = state.nftRecipient
                                            if (state.nftRecipient == "") {
                                                nftRecipient = await signer.getAddress()
                                            }
                                            txn = await router.swapETHForSpecificNFTs(
                                                swapList,
                                                tokenRecipient,
                                                nftRecipient,
                                                deadline,
                                                {
                                                    value: ethers.utils.parseEther(state.tokenAmount),
                                                    gasLimit: 30000000,
                                                }
                                            )
                                            break
                                    }

                                    break
                                default:
                                    break;
                            }


                            const tx = await txn.wait();
                            console.log("TXN Events", tx.events);
                            console.log('Sucessfully Swapped NFt for eth using type 0 pool', tx.hash);
                        }}>
                        SwapNFTsForETH
                    </button>
                </div>

            </div>
            <span style={{ flex: 1 }} />
        </div>
    )


}