import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts, getDefaultTxnParams } from '../../environment'
import SwapList from './components/SwapList'


const RobustSwapERC20ForSpecificNFTs = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([])     // RobustPairSwapSpecific[] swapList
    const [nftRecipient, setNFTRecipient] = React.useState("")    // address nftRecipient
    const [deadline, setDeadline] = React.useState("0")    // uint256 deadline
    const [amount, setAmount] = React.useState("0")    // uint256 deadline

    return (
        <div>
            <table style={{
                margin: 5, minWidth: 500,
                // border: 'solid', borderWidth: 1, borderColor: "red"
            }}>
                <thead>
                    <tr>
                        <th style={{ width: "30%" }} />
                        <th style={{ width: "70%" }} />
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td>NFT Recipient</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                value={nftRecipient}
                                onChange={event => setNFTRecipient(event.target.value)} />
                        </td>
                    </tr>

                    <tr>
                        <td>Deadline</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                type="number" step={1} min={5}
                                value={deadline}
                                onChange={event => setDeadline(event.target.value)} />
                        </td>
                    </tr>

                    <tr>
                        <td>Input Amount</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                type="number" step={0.001} min={0}
                                value={amount}
                                onChange={event => {
                                    setAmount(event.target.value)
                                }} />
                        </td>
                    </tr>
                </tbody>
            </table>

            <SwapList
                type="RobustPairSwapSpecific"
                swapList={swapList}
                onChange={swapList => {
                    // prints the Swaplist
                    console.log(swapList)
                    setSwapList(swapList)
                }} />

            <div style={{ textAlign: "center" }}>
                <button onClick={async () => {

                    await provider.send("eth_requestAccounts");

                    const signer = provider.getSigner()
                    const signerAddress = await signer.getAddress()
                    console.log("This is signer address", signerAddress)

                    const router = createRouterContract(signer)

                    // create a params object with correct values to be used as swap
                    // transaction arguments
                    const params = {
                        deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
                        nftRecipient: nftRecipient != "" ? nftRecipient : await signer.getAddress(),
                        swapList: await Promise.all(swapList.map(async function (swap) {
                            const pair = contracts.pair(swap.swapInfo.pair)
                            const nftAddress = await pair.nft()
                            const nft  = contracts.ERC721(nftAddress)
                            console.log(await nft.ownerOf(swap.swapInfo.nftIds[0]))
                            return [
                                [swap.swapInfo.pair, swap.swapInfo.nftIds],
                                ethers.utils.parseEther(swap.maxCost)

                            ]
                        })),
                        inputAmount: ethers.utils.parseEther(amount),
                    }

                    // ensure that all pairs have same ERC20 token
                    const getTokenAddr = async (swap) => {
                        const pair = new ethers.Contract(swap.swapInfo.pair, ["function token() public pure returns (address _token)"], provider)
                        return await pair.token()
                    }
                    const promises = swapList.map(getTokenAddr)
                    const tokenAddrs = await Promise.all(promises)
                    let set = new Set(tokenAddrs)
                    if (set.size > 1) {
                        // tokenAddrs.values().map()
                        alert("Please ensure swapList contains pairs of a single ERC20 token!")
                        return
                    }

                    // Approve router to access ERC20 token of the pairs
                    const tokenAddr = tokenAddrs[0]
                    const erc20 = contracts.ERC20(tokenAddr, signer)
                    let txn = await erc20.approve(router.address, params.inputAmount)
                    await txn.wait()

                    console.log("I'm here...")
                    console.log(params)


                    // Create a swap transaction
                    txn = await router.robustSwapERC20ForSpecificNFTs(
                        params.swapList,
                        params.inputAmount,
                        params.nftRecipient,
                        params.deadline,
                        {
                            ...getDefaultTxnParams(),
                        }
                    )

                    await txn.wait()

                }}>Send Transaction!</button>
            </div>

        </div>
    )

}


export default RobustSwapERC20ForSpecificNFTs