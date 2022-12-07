import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts } from '../../environment'
import SwapList from './components/SwapList'


const SwapETHForSpecificNFTs = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([])     // PairSwapSpecific[] swapList
    const [ethValue, setETHValue] = React.useState("0")
    const [nftRecipient, setNFTRecipient] = React.useState("")    // address nftRecipient
    const [ethRecipient, setETHRecipient] = React.useState("")    // address nftRecipient
    const [deadline, setDeadline] = React.useState("0")    // uint256 deadline

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
                        <td>ETH Amount</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                type="number" step="0.001" min="0"
                                value={ethValue}
                                onChange={event => setETHValue(event.target.value)} />
                        </td>
                    </tr>

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

                </tbody>
            </table>

            <SwapList
                type="PairSwapSpecific"
                swapList={swapList}
                onChange={swapList => {
                    console.log(swapList)
                    setSwapList(swapList)
                }} />

            <div style={{ textAlign: "center" }}>
                <button onClick={async () => {

                    await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                    const signer = provider.getSigner()

                    const router = createRouterContract(signer)

                    const params = {
                        deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
                        nftRecipient: nftRecipient != "" ? nftRecipient : await signer.getAddress(),
                        ethRecipient: ethRecipient != "" ? ethRecipient : await signer.getAddress(),
                        swapList: swapList.map(function(swap) {
                            return [
                                swap.pair, swap.nftIds
                            ]
                        }),

                    }
                    console.log(params.swapList)
                    let txn = await router.swapETHForSpecificNFTs(
                        params.swapList,
                        params.ethRecipient,
                        params.nftRecipient,
                        params.deadline,
                        {
                            gasLimit: 30000000,
                            value: ethers.utils.parseEther(ethValue),

                        }
                    )

                    await txn.wait()

                }}>Send Transaction!</button>
            </div>

        </div>
    )

}


export default SwapETHForSpecificNFTs