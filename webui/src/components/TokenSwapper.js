import React from 'react';
import { ethers } from 'ethers';
import config from '../config';
import AddressInput from "./utils/AddressInput.js"
import BalanceInput from "./utils/BalanceInput.js"


const ownerOf = async (nft, id) => {
    const erc721ABI = config.ERC721.abi
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contract = new ethers.Contract(nft, erc721ABI, provider)
    return await contract.ownerOf(id)
}

const getOwners = async (nft) => {
    return await Promise.all(
        Array.from(new Array(50)).map(async (_, i) => {
            return await ownerOf(nft, i)
        }))
}

const sendNFTs = async (nft, ids, to) => {
    const erc721ABI = config.ERC721.abi
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\
    console.log(accounts);

    const signer = provider.getSigner()
    const signerAddress = await signer.getAddress()

    const contract = new ethers.Contract(nft, erc721ABI, signer)

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]
        // let txn = await erc721.approve(operator, nftId)
        const txn = await contract.transferFrom(signerAddress, to, id)
        await txn.wait()
    }
}

const getNFTFromPair = async (pair, provider) => {
    const contract = new ethers.Contract(pair, config.Pair.abi, provider);
    return await contract.nft()
}

const setApprovalToOperator = async (nft, ids, operator, signer) => {
    if (ids.length > 0) {
        const signerAddress = await signer.getAddress()

        // allow operator contract to access all nft ids
        const erc721 = new ethers.Contract(nft, config.ERC721.abi, signer)

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
    swapETHForAnyNFTs: 0,
    swapETHForSpecificNFTs: 1,
    swapNFTsForAnyNFTsThroughETH: 2,
    swapNFTsForSpecificNFTsThroughETH: 3,
    swapNFTsForToken: 4,
    // ...
}



export default ({
    selectedPair,
}) => {
    const [state, setState] = React.useState({
        swapType: SwapTypes.swapNFTsForToken,
        minOutput: "0",
        deadline: "10",
        tokenRecipient: "0x093A41044Fb3Eb2d6E94AB5419E4b2B08271Aa32",
        swap: {
            pair: "",
            nftIds: [],
        }
    })

    React.useEffect(() => {
        setState({ ...state, swap: { ...state.swap, pair: selectedPair }})
    }, [selectedPair])

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

                        <BalanceInput
                            name="Minimum Output"
                            value={state.minOutput}
                            onChange={minOutput => setState({ ...state, minOutput })} />

                        <AddressInput
                            name='Token Recipient'
                            address={state.tokenRecipient}
                            onChange={tokenRecipient => setState({ ...state, tokenRecipient })} />

                        <BalanceInput
                            name="Deadline"
                            value={state.deadline}
                            onChange={deadline => setState({ ...state, deadline })} />

                        <AddressInput
                            name='Pair'
                            address={state.swap.pair}
                            onChange={pair => setState({ ...state, swap: { ...state.swap, pair } })} />

                        <tr>
                            <td style={{ display: 'flex', flexDirection: 'row' }}>
                                <span>NFT IDs</span>
                                <span style={{ flex: 1 }} />
                                <input title='SetApprovalForAll'
                                    type='checkbox'
                                    checked={state.setApprovalForAll}
                                    onChange={event => {
                                        setState({
                                            ...state,
                                            setApprovalForAll: !state.setApprovalForAll,
                                        })
                                    }} />
                            </td>
                            <td>
                                <input
                                    value={state.swap.nftIds.join(",")}
                                    onChange={event => {
                                        setState({
                                            ...state,
                                            swap: { ...state.swap, nftIds: event.target.value.split(",") }
                                        })
                                    }} />
                            </td>
                        </tr>

                    </tbody>
                </table>
                <div style={{ textAlign: 'center' }}>
                    <button
                        style={{ margin: 5 }}
                        onClick={async (event) => {

                            // await sendNFTs(
                            //     "0xA50c218C73B0b087d4492587bCF104Ab786b2150",
                            //     [45, 46, 47, 48, 49],
                            //     "0xD96D3D8a3a35552b297Da318248CC0B6676c335a"
                            // )
                            // return
                            let routerABI = config.Router.abi;
                            let routerAddress = config.Router.address;

                            const provider = new ethers.providers.Web3Provider(window.ethereum);

                            const accounts = await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\
                            console.log(accounts);

                            const signer = provider.getSigner()

                            const signerAddress = await signer.getAddress()

                            const router = new ethers.Contract(
                                routerAddress, routerABI, signer
                            )

                            const nft = await getNFTFromPair(state.swap.pair, provider)
                            const nftIds = state.swap.nftIds

                            // console.log(await getOwners(nft))
                            // return

                            await setApprovalToOperator(nft, nftIds, routerAddress, signer)

                            const swapList = [
                                [state.swap.pair, nftIds]
                            ];

                            let tokenRecipient = state.tokenRecipient
                            if (state.tokenRecipient == "") {
                                tokenRecipient = signerAddress
                            }

                            let deadline = Date.now() + Math.floor(1000 * parseFloat(state.deadline))

                            let txn
                            switch (state.swapType) {
                                case SwapTypes.swapNFTsForToken:
                                    txn = await router.swapNFTsForToken(
                                        swapList,
                                        ethers.utils.parseEther(state.minOutput),
                                        tokenRecipient,
                                        deadline,
                                    )
                                    break;
                                case SwapTypes.swapETHForAnyNFTs:
                                    // code
                                    
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