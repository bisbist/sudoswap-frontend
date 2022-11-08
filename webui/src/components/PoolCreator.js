import React from 'react';
import { ethers } from 'ethers';
import config from '../config';
import AddressInput from "./utils/AddressInput.js"
import BalanceInput from "./utils/BalanceInput.js"

const TokenType = {
    ETH: "ETH",
    ERC20: "ERC20",
}

const PoolType = {
    TOKEN: "0",
    NFT: "1",
    TRADE: "2",
}

const PoolCreator = () => {
    const [state, setState] = React.useState({
        tokenType: TokenType.ETH,
        nft: "0xA50c218C73B0b087d4492587bCF104Ab786b2150",
        bondingCurve: config.BondingCurve.linear.address,
        assetRecipient: "",
        poolType: PoolType.TOKEN,
        delta: "0",
        fee: "0",
        spotPrice: "0",
        initialNFTIDs: [],
        initialBalance: "0",
        erc20Addr: "0x9000Afeb2C460379B5bB29f1946B4124Be873ceD", // erc20 address for ERC20 token type

        // optional setApprovalForAll vs Specific NFT approval, set true for large number of nfts in initialNFTIDs
        setApprovalForAll: false
    });

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
                            <td>Token Type</td>
                            <td>
                                <select
                                    style={{ width: '100%' }}
                                    value={state.tokenType}
                                    onChange={event => {
                                        setState({ ...state, tokenType: event.target.value })
                                    }} >
                                    <option value={TokenType.ETH}>ETH</option>
                                    <option value={TokenType.ERC20}>ERC20</option>
                                </select>
                            </td>
                        </tr>
                        {
                            state.tokenType == TokenType.ERC20 ? (
                                <AddressInput
                                    name='ERC20 Address'
                                    address={state.erc20Addr}
                                    onChange={token => setState({ ...state, erc20Addr: token })} />
                            ) : null
                        }
                        <AddressInput
                            name='NFT Address'
                            address={state.nft}
                            onChange={nft => setState({ ...state, nft })} />
                        <AddressInput
                            name='Bonding Curve'
                            address={state.bondingCurve}
                            onChange={bondingCurve => setState({ ...state, bondingCurve })} />
                        {
                            state.poolType != PoolType.TRADE ? (
                                <AddressInput
                                    name='Asset Recipient'
                                    address={state.assetRecipient}
                                    onChange={assetRecipient => setState({ ...state, assetRecipient })} />
                            ) : null
                        }

                        <tr>
                            <td>Pool Type</td>
                            <td>
                                <select
                                    style={{ width: '100%' }}
                                    value={state.poolType}
                                    onChange={event => {
                                        setState({ ...state, poolType: event.target.value })
                                    }} >
                                    <option value={PoolType.TOKEN}>TOKEN</option>
                                    <option value={PoolType.NFT}>NFT</option>
                                    <option value={PoolType.TRADE}>TRADE</option>
                                </select>
                            </td>
                        </tr>

                        <BalanceInput
                            name="Delta"
                            value={state.delta}
                            onChange={delta => setState({ ...state, delta })} />
                        {
                            state.poolType == PoolType.TRADE ? (
                                <BalanceInput
                                    name="Fee"
                                    value={state.fee}
                                    onChange={fee => setState({ ...state, fee })} />
                            ) : null
                        }

                        <BalanceInput
                            name="Spot Price"
                            value={state.spotPrice}
                            onChange={spotPrice => setState({ ...state, spotPrice })} />

                        <BalanceInput
                            name="Initial Balance"
                            value={state.initialBalance}
                            onChange={initialBalance => setState({ ...state, initialBalance })} />

                        {
                            state.poolType != PoolType.TOKEN ? (
                                <tr>
                                    <td style={{ display: 'flex', flexDirection: 'row' }}>
                                        <span>Initial NFTIDs</span>
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
                                            value={state.initialNFTIDs.join(",")}
                                            onChange={event => {
                                                setState({
                                                    ...state,
                                                    initialNFTIDs: event.target.value.split(",")
                                                })
                                            }} />
                                    </td>
                                </tr>
                            ) : null
                        }
                    </tbody>
                </table>
                <div style={{ textAlign: 'center' }}>
                    <button
                        style={{ margin: 5 }}
                        onClick={async (event) => {
                            ensureMetamaskWallet();
                            validatePoolCreatorInput(state);
                            await switchOrAddCustomNetwork();

                            const provider = new ethers.providers.Web3Provider(window.ethereum);

                            await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site

                            const signer = await provider.getSigner()
                            const signerAddress = await signer.getAddress()
                            console.log(signerAddress)

                            const params = { ...state }

                            // set default asset recipient to signer for TOKEN, and NFT pools
                            if (params.poolType == PoolType.TRADE) {
                                params.assetRecipient = ethers.constants.AddressZero
                            } else if (!params.assetRecipient) {
                                params.assetRecipient = signerAddress;
                            }

                            const factory = new ethers.Contract(
                                config.PairFactory.address, config.PairFactory.abi, signer)

                            let wasApprovedForAll = false;
                            let erc721;

                            // set approvals to factory
                            if (params.initialNFTIDs.length > 0) {
                                // allow factory contract to access all nft ids in 
                                // initialNFTIDs
                                erc721 = new ethers.Contract(
                                    params.nft, config.ERC721.abi, signer)

                                const initialNFTIDs = params.initialNFTIDs
                                // const initialNFTIDs = Array.from(new Array(50)).map((_, i) => i)

                                // don't allow nfts that's not owned by signer
                                const ownerships = await Promise.all(
                                    initialNFTIDs.map(async nftId => ({
                                        nftId,
                                        owner: await erc721.ownerOf(nftId),
                                    })))
                                const ownedNFTIDs = ownerships
                                    .filter(ownership => ownership.owner == signerAddress)
                                    .map(ownership => ownership.nftId)

                                const notOwnedNFTIDs = initialNFTIDs.filter(nftId => !ownedNFTIDs.find(id => id == nftId))

                                if (notOwnedNFTIDs.length > 0) {
                                    alert(`Please remove from initial NFTs list! You don't own following NFTs: ${notOwnedNFTIDs}`)
                                    return
                                }

                                // for (let i = 45; i < 50; i++) {
                                //     let txn = await erc721.transferFrom(signerAddress, "0xC09CA053bfebf95e9D5108876eB3BAa728cA49AF", i)
                                //     await txn.wait()
                                // }
                                // return

                                if (!await erc721.isApprovedForAll(signerAddress, factory.address)) {
                                    console.log("not here")
                                    if (state.setApprovalForAll) {

                                        let txn = await erc721.setApprovalForAll(factory.address, true)
                                        await txn.wait()
                                        wasApprovedForAll = true;

                                    } else {

                                        // get list of nft ids that are not approved to factory address
                                        const approvals = await Promise.all(
                                            ownedNFTIDs.map(async nftId => ({
                                                nftId,
                                                operator: await erc721.getApproved(nftId),
                                            }))
                                        )
                                        const nftIdsToApprove = approvals.filter(approval =>
                                            approval.operator != factory.address
                                        ).map(approval => approval.nftId)

                                        console.log("approvals:", approvals)
                                        console.log("nftIdsToApprove:", nftIdsToApprove)

                                        for (let i = 0; i < nftIdsToApprove.length; i++) {
                                            const nftId = nftIdsToApprove[i]
                                            let txn = await erc721.approve(factory.address, nftId)
                                            await txn.wait()
                                        }

                                    }


                                }

                            }

                            if (params.tokenType == TokenType.ERC20) {
                                // allow factory contract to access initialTokenBalance
                                // amount of ERC20 (token)
                                const erc20 = new ethers.Contract(
                                    params.erc20Addr, config.ERC20.abi, signer)

                                const initialTokenBalance = ethers.utils.parseEther(params.initialBalance)

                                const balance = await erc20.balanceOf(signerAddress)

                                if (initialTokenBalance.gt(balance)) {
                                    alert(`Insufficient Balance: ${ethers.utils.formatEther(balance)}, require: ${ethers.utils.formatEther(initialTokenBalance)}!`)
                                    return
                                }

                                while (true) {
                                    const allowance = await erc20.allowance(signerAddress, factory.address)
                                    console.log(allowance, initialTokenBalance)
                                    if (!initialTokenBalance.gt(allowance)) {
                                        break
                                    }
                                    let txn = await erc20.approve(factory.address, initialTokenBalance)
                                    await txn.wait()
                                }
                            }

                            if (params.tokenType == TokenType.ETH) { // createPairETH
                                factory.createPairETH(
                                    params.nft,
                                    params.bondingCurve,
                                    params.assetRecipient,
                                    params.poolType,
                                    ethers.utils.parseEther(params.delta),
                                    ethers.utils.parseEther(params.fee),
                                    ethers.utils.parseEther(params.spotPrice),
                                    params.initialNFTIDs,
                                    {
                                        value: ethers.utils.parseEther(params.initialBalance)
                                    }
                                )
                            } else { // createPairERC20
                                factory.createPairERC20([
                                    params.erc20Addr,
                                    params.nft,
                                    params.bondingCurve,
                                    params.assetRecipient,
                                    params.poolType,
                                    ethers.utils.parseEther(params.delta),
                                    ethers.utils.parseEther(params.fee),
                                    ethers.utils.parseEther(params.spotPrice),
                                    params.initialNFTIDs,
                                    ethers.utils.parseEther(params.initialBalance),
                                ])
                            }

                            // unapprove factory to access NFTIDs
                            if (wasApprovedForAll && !!erc721) {
                                let txn = await erc721.setApprovalForAll(factory.address, false)
                                await txn.wait()
                            }
                        }}>
                        Create Pool
                    </button>
                </div>

            </div>
            <span style={{ flex: 1 }} />
        </div>
    );
}

const validatePoolCreatorInput = params => {
    if (!ethers.utils.isAddress(params.nft)) {
        alert("Please enter valid NFT address!")
    }
    if (!ethers.utils.isAddress(params.bondingCurve)) {
        alert("Please enter valid Bonding Curve address!")
    }
    // if (params.poolType == PoolType.TRADE && 
    //     params.assetRecipient != ethers.constants.AddressZero) {
    //     alert("Non-Zero Asset Recipient for TRADE pool!")
    // }
    // if (!ethers.utils.isAddress(params.assetRecipient)) {
    //     alert("Please enter valid Asset Recipient address!")
    // }
}

async function switchOrAddCustomNetwork() {
    // switch to custom network or add it
    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: config.chain.id }],
        })
    } catch (switchError) {
        console.log(switchError)
        if (switchError.code == 4902) { // chain does not exist
            console.log("switch error")
            try {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: config.chain.id,
                        rpcUrls: [config.chain.rpcUrl],
                        chainName: config.chain.name,
                        nativeCurrency: {
                            name: config.chain.coin.name,
                            symbol: config.chain.coin.symbol,
                            decimals: config.chain.coin.decimals,
                        },
                    }],
                })
            } catch (addError) {
                console.log("add error", addError)
            }
        }
    }
}

function ensureMetamaskWallet() {
    if (!window.ethereum) {
        alert("Please install Metamask!")
    }
}

export default PoolCreator;