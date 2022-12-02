import React from "react"
import PairSwapAny from "./PairSwapAny"


const RobustPairSwapAny = ({
    value: { swapInfo: { pair, numItems }, maxCost },
    onChange,
}) => {
    return (
        <div>
            <PairSwapAny
                value={{ pair, numItems }}
                placeholder = "numItems"
                onChange={swapInfo => {
                    onChange({ swapInfo, maxCost })
                }} />
            <input
                type="number" step={0.001}
                value={maxCost}
                placeholder = "maxCost"
                onChange={event => {
                    onChange({
                        swapInfo: { pair, numItems },
                        maxCost: event.target.value,
                    })
                }} />
        </div>
    )
}

export default RobustPairSwapAny