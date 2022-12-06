import React from "react"
import PairSwapAny from "./PairSwapAny"
import PairSwapSpecific from "./PairSwapSpecific"

// [{ pair, nftIds }], [{ pair, numItems }]
const NFTsForAnyNFTsTrade = ({
    value: { nftToTokenTrades, tokenToNFTTrades },
    onChange,
}) => {
    return (
        <div>
            {
                nftToTokenTrades.map((value, i) => {
                    <PairSwapSpecific
                        key={i}
                        value={value}
                        onChange={value => {
                            const newNFTToTokenTrades = [...nftToTokenTrades]
                            newNFTToTokenTrades[i] = value
                            onChange({
                                tokenToNFTTrades,
                                nftToTokenTrades: newNFTToTokenTrades,
                            })
                        }} />
                })
            }
            {
                nftToTokenTrades.map((value, i) => {
                    <PairSwapAny
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
        </div>
    )
}

export default NFTsForAnyNFTsTrade