import React from "react"


const PairSwapAny = ({
    value: { pair, numItems},
    onChange,
}) => {
    return (
        <div style={{ width: "100%", display: "flex" }}>
            <input
                style={{ flex: 1 }}
                value={pair}
                placeholder="Pair Address"
                onChange={event => {
                    onChange({ numItems, pair: event.target.value })
                }} />
            <input 
                type="number" step={1} min={1}
                placeholder="Number of Items"
                value={numItems}
                onChange={event => {
                    onChange({ pair, numItems: event.target.value })
                }} />
        </div>
    )
}

export default PairSwapAny