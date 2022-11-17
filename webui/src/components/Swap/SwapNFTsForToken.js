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
        <div>
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

            <div>
                <input
                    type="number" step={0.001} min={0}
                    value={minOutput}
                    onChange={event => {
                        setMinOutput(event.target.value)
                    }} />
            </div>

            <div>
                <input
                    value={tokenRecipient}
                    onChange={event => setTokenRecipient(event.target.value)} />
            </div>

            <div>
                <input
                    type="number" step={1} min={5}
                    value={deadline}
                    onChange={event => setDeadline(event.target.value)} />

            </div>


            <button onClick={async () => {

                await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                const signer = provider.getSigner()

                const router = createRouterContract(signer)

                let deadline = Date.now() + Math.floor(1000 * parseFloat(deadline))

                if (tokenRecipient == "") {
                    tokenRecipient = await signer.getAddress()
                }

                let txn = await router.SwapNFTsForToken(
                    swapList.map(swap => [swap.pair, swap.nftIds]),
                    ethers.utils.parseEther(minOutput),
                    tokenRecipient,
                    deadline,
                    {
                        gasLimit: 30000000,
                    }
                )

                await txn.wait()

            }}>Send Transaction!</button>

        </div>
    )

}


export default SwapNFTsForToken