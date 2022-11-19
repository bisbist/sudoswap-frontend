import React from 'react'
import { ethers } from 'ethers'
import { provider, contracts } from '../../environment'
import SwapList from './components/SwapList'
import config from '../../config'


const TokenType = {
    ETH: "ETH",
    ERC20: "ERC20",
}

const SwapNFTsForToken = ({
    router: { name: routerName, createContract: createRouterContract },
}) => {

    const [swapList, setSwapList] = React.useState([])     // PairSwapAny[] swapList
    const [tokenRecipient, setTokenRecipient] = React.useState("")    // address payable ethRecipient
    const [deadline, setDeadline] = React.useState("0")    // uint256 deadline
    const [minOutput, setMinoutput] = React.useState("0")    // uint256 deadline
    // const [amount, setAmount] = React.useState("0")

    return (
        <div>
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
                        <td>minOutput</td>
                        <td>
                            <input
                                style={{ width: "97.5%" }}
                                type="number" step="0.001" min="0"
                                value={minOutput}
                                onChange={event => setMinoutput(event.target.value)} />
                        </td>
                    </tr>

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
                    // connect specific metamask wallet with this site\
                    await provider.send("eth_requestAccounts");

                    const signer = provider.getSigner()
                    const signerAddress = await signer.getAddress()
                    console.log("This is signer address", signerAddress)

                    const router = createRouterContract(signer)

                    // Sets approval to router
                    for (let swap of swapList) {
                        const pair = contracts.pair(swap.pair)
                        if (swap.nftIds.length > 0) {
                            const nft = contracts.ERC721(await pair.nft(), signer)


                            if (swap.flag) {
                                const isApprovedForAll = await nft.
                                    isApprovedForAll(signerAddress, router.address)

                                if (!isApprovedForAll) {
                                    await nft.setApprovalForAll(router.address, true)
                                }
                            } else {
                                for (let nftId of swap.nftIds) {
                                    const nftOwner = await nft.ownerOf(nftId)
                                    const operator = await nft.getApproved(nftId)
                                    if (operator != router.address) {
                                        // approve
                                        const isApprovedForAll = await nft.
                                            isApprovedForAll(nftOwner, signerAddress)
                                        if (signerAddress == nftOwner || isApprovedForAll) {
                                            const txn = await nft.approve(router.address, nftId, { gasLimit: 50000 })
                                            await txn.wait()
                                        } else {
                                            alert(`NFT#${nftId}: ${signerAddress} is not an owner or approved for all! owner=${nftOwner}, operator=${operator}`)
                                            return
                                        }
                                    }
                                }
                            }
                        }
                    }

                    const params = {
                        deadline: Date.now() + Math.floor(1000 * parseFloat(deadline)),
                        tokenRecipient: tokenRecipient != "" ? tokenRecipient : signerAddress,
                        swapList: swapList.map(swap => [swap.pair, swap.nftIds]),
                        minOutput: ethers.utils.parseEther(minOutput),
                    }

                    console.log(params)

                    let txn = await router.swapNFTsForToken(
                        params.swapList,
                        params.minOutput,
                        params.tokenRecipient,
                        params.deadline,
                        {
                            gasLimit: 30000000,
                            // value: ethers.utils.parseEther(amount),
                        }
                    )

                    await txn.wait()

                }}>Send Transaction!</button>
            </div>

        </div>
    )

}


export default SwapNFTsForToken