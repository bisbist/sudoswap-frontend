import React from "react"
import PairSwapSpecific from "./PairSwapSpecific"


const RobustPairSwapSpecific = ({
    value: { swapInfo: { pair, nftIds }, maxCost },
    onChange,
}) => {
    return (
        <div>
            <PairSwapSpecific
                value={{ pair, nftIds }}
                onChange={swapInfo => {
                    onChange({ swapInfo, maxCost })
                }} />
            <input
                type="number" step={0.001} min={0}
                value={maxCost}
                onChange={event => {
                    onChange({
                        swapInfo: { pair, nftIds },
                        maxCost: event.target.value,
                    })
                }} />
        </div>
    )
}

export default RobustPairSwapSpecific