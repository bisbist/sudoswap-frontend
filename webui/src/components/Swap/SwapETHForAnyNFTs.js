import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts } from '../../environment'
import PairSwapAny from './components/PairSwapAny'


const SwapETHForAnyNFTs = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([{ pair: "", numItems: 0 }])     // PairSwapAny[] swapList
    const [ethRecipient, setETHRecipient] = React.useState("")    // address payable ethRecipient
    const [nftRecipient, setNFTRecipient] = React.useState("")    // address nftRecipient
    const [deadline, setDeadline] = React.useState("0")    // uint256 deadline
    const [amount, setAmount] = React.useState("0")    // uint256 deadline

    return (
        <div>
            {
                swapList.map((swap, i) => {
                    return (
                        <div key={i} style={{ display: "flex" }}>
                            <PairSwapAny value={swap} onChange={value => {
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
                const newSwapList = [...swapList, { pair: "", numItems: 0 }]
                setSwapList(newSwapList)
            }}>Add Swap!</button>

            <div>
                <input
                    value={ethRecipient}
                    onChange={event => setETHRecipient(event.target.value)} />
            </div>

            <div>
                <input
                    value={nftRecipient}
                    onChange={event => setNFTRecipient(event.target.value)} />
            </div>

            <div>
                <input
                    type="number" step={1} min={5}
                    value={deadline}
                    onChange={event => setDeadline(event.target.value)} />
            </div>

            <div>
                <input
                    type="number" step={0.001} min={0}
                    value={amount}
                    onChange={event => {
                        setAmount(event.target.value)
                    }} />
            </div>


            <button onClick={async () => {

                await provider.send("eth_requestAccounts"); // connect specific metamask wallet with this site\

                const signer = provider.getSigner()

                const router = createRouterContract(signer)

                let deadline = Date.now() + Math.floor(1000 * parseFloat(deadline))

                if (ethRecipient == "") {
                    ethRecipient = await signer.getAddress()
                }

                if (nftRecipient == "") {
                    nftRecipient = await signer.getAddress()
                }

                let txn = await router.swapETHForSpecificNFTs(
                    swapList.map(swap => [swap.pair, swap.numItems]),
                    ethRecipient,
                    nftRecipient,
                    deadline,
                    {
                        value: ethers.utils.parseEther(amount),
                        gasLimit: 30000000,
                    }
                )

                await txn.wait()

            }}>Send Transaction!</button>

        </div>
    )

}


export default SwapETHForAnyNFTs