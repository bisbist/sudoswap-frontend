import React from "react"
import PairSwapAny from "./PairSwapAny"
import RobustPairSwapSpecific from "./RobustPairSwapSpecific"
import RobustPairSwapSpecificForToken from "./RobustPairSwapSpecificForToken"

// [{ pair, nftIds }], [{ pair, numItems }]
const NFTsForAnyNFTsTrade = ({
    value: { nftToTokenTrades, tokenToNFTTrades },
    onChange,
}) => {
    const [inputAmount, setInputAmount] = React.useState("0")    // uint256 
    const [tokenRecipient, setTokenRecipient] = React.useState("")    // address payable
    const [nftRecipient, setNFTRecipient] = React.useState("")    // address

    return (
        <div>
            {
                tokenToNFTTrades.map((value, i) => {
                    <RobustPairSwapSpecific
                        key={i}
                        value={value}
                        onChange={value => {
                            const newTokenToNFTTrades = [...tokenToNFTTrades]
                            newTokenToNFTTrades[i] = value
                            onChange({
                                nftToTokenTrades,
                                tokenToNFTTrades: newTokenToNFTTrades,
                            })
                        }} />
                })
            }
            {
                nftToTokenTrades.map((value, i) => {
                    <RobustPairSwapSpecificForToken
                        key={i}
                        value={value}
                        onChange={value => {
                            const newTokenToNFTTrades = [...nftToTokenTrades]
                            newTokenToNFTTrades[i] = value
                            onChange({
                                tokenToNFTTrades,
                                nftToTokenTrades: newTokenToNFTTrades,
                            })
                        }} />
                })
            }

            <div>
                <input
                    type="number" step={0.001} min={0}
                    value={inputAmount}
                    onChange={event => {
                        setInputAmount(event.target.value)
                    }} />
            </div>

            <div>
                <input
                    value={tokenRecipient}
                    onChange={event => setTokenRecipient(event.target.value)} />
            </div>

            <div>
                <input
                    value={nftRecipient}
                    onChange={event => setNFTRecipient(event.target.value)} />
            </div>

        </div>
    )
}

export default NFTsForAnyNFTsTrade