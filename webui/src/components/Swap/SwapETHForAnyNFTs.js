import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts, getDefaultTxnParams } from '../../environment'
import SwapList from './components/SwapList'


const SwapETHForAnyNFTs = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([])     // PairSwapAny[] swapList
    const [ethRecipient, setETHRecipient] = React.useState("")    // address payable ethRecipient
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
                        <td>ETH Recipient</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                value={ethRecipient}
                                onChange={event => setETHRecipient(event.target.value)} />
                        </td>
                    </tr>

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
                        <td>Amount</td>
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
                type="PairSwapAny"
                swapList={swapList}
                onChange={swapList => {
                    console.log(swapList)
                    setSwapList(swapList)
                }} />

            <div style={{ textAlign: "center" }}>
                <button onClick={async () => {

                    await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                    const signer = provider.getSigner()
                    console.log(signer)

                    const router = createRouterContract(signer)

                    const params = {
                        deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
                        ethRecipient: ethRecipient != "" ? ethRecipient : await signer.getAddress(),
                        nftRecipient: nftRecipient != "" ? nftRecipient : await signer.getAddress(),
                        swapList: swapList.map(swap => [swap.pair, swap.numItems]),
                    }

                    let txn = await router.swapETHForAnyNFTs(
                        params.swapList,
                        params.ethRecipient,
                        params.nftRecipient,
                        params.deadline,
                        {
                            value: ethers.utils.parseEther(amount),
                            ...getDefaultTxnParams(),
                        }
                    )

                    await txn.wait()

                }}>Send Transaction!</button>
            </div>

        </div>
    )

}


export default SwapETHForAnyNFTs