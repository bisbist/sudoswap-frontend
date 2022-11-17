import React from 'react'
import { ethers } from "ethers"
import { provider } from '../../environment'
import PairSwapSpecific from './components/PairSwapSpecific'


const SwapNFTsForToken = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([{ pair: "", nftIds: [] }])     // PairSwapAny[] swapList
    const [minOutput, setMinOutput] = React.useState("0")    // uint256 deadline
    const [tokenRecipient, setTokenRecipient] = React.useState("")    // address payable ethRecipient
    const [deadline, setDeadline] = React.useState("0")    // uint256 deadline

    return (
        <div style={{ textAlign: "right" }}>
            <table style={{
                margin: 5, minWidth: 500,
                border: 'solid', borderWidth: 1, borderColor: "red"
            }}>
                <thead>
                    <tr>
                        <th style={{ width: "30%" }} />
                        <th style={{ width: "70%" }} />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Token Recipient</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                value={tokenRecipient}
                                onChange={event => setTokenRecipient(event.target.value)} />
                        </td>
                    </tr>

                    <tr>
                        <td>MinOutput</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                value={minOutput}
                                onChange={event => setMinOutput(event.target.value)} />
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
            {
                swapList.map((swap, i) => {
                    return (
                        <div key={i} style={{ display: "flex" }}>
                            <PairSwapSpecific value={swap} onChange={value => {
                                const newSwapList = [...swapList]
                                newSwapList[i] = value
                                setSwapList(newSwapList)
                            }} />
                            <button onClick={() => {
                                const newSwapList = swapList.filter((_, index) => index != i)
                                setSwapList(newSwapList)
                            }}>x</button>
                        </div>
                    )
                })
            }

            <button onClick={() => {
                const newSwapList = [...swapList, { pair: "", nftIds: [] }]
                setSwapList(newSwapList)
            }}>Add Swap!</button>

            <div style={{ textAlign: "center" }}>
            <button onClick={async () => {

                await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                const signer = provider.getSigner()
                console.log(signer.getAddress())

                const router = createRouterContract(signer)
                const params = {
                    deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
                    tokenRecipient: tokenRecipient != "" ? tokenRecipient : await signer.getAddress(),
                    swapList: swapList.map(swap => [swap.pair, swap.nftIds]),
                    minOutput: ethers.utils.parseEther(minOutput),
                }

                let txn = await router.swapNFTsForToken(
                    params.swapList,
                    params.minOutput,
                    params.tokenRecipient,
                    params.deadline,
                    {
                        gasLimit: 30000000,
                    }
                )
                console.log("here we are")
                await txn.wait()


            }}>Send Transaction!</button>
            </div>

        </div>
    )

}


export default SwapNFTsForToken