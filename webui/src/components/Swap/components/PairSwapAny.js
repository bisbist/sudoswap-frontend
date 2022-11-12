import React from "react"


const PairSwapAny = ({
    value: { pair, numItems},
    onChange,
}) => {
    return (
        <div>
            <input
                value={pair}
                onChange={event => {
                    onChange({ numItems, pair: event.target.value })
                }} />
            <input 
                type="number" step={1} min={1} 
                value={numItems}
                onChange={event => {
                    onChange({ pair, numItems: event.target.value })
                }} />
        </div>
    )
}

export default PairSwapAny