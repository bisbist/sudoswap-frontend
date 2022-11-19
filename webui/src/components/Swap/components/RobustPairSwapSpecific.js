import React from "react"
import PairSwapSpecific from "./PairSwapSpecific"


const RobustPairSwapSpecific = ({
    value: { swapInfo, maxCost },
    onChange,
}) => {
    return (
        <div>
            <PairSwapSpecific
                value={swapInfo}
                onChange={swapInfo => {
                    onChange({ swapInfo, maxCost })
                }} />
            <input
                type="number" step={0.001} min={0}
                value={maxCost}
                onChange={event => {
                    onChange({
                        swapInfo,
                        maxCost: event.target.value,
                    })
                }} />
        </div>
    )
}

export default RobustPairSwapSpecific