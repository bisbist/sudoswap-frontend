import React from "react"


const PairSwapSpecific = ({
    value: { pair, nftIds },
    onChange,
}) => {
    return (
        <div>
            <input
                value={pair}
                onChange={event => {
                    onChange({ nftIds, pair: event.target.value })
                }} />
            <input 
                value={nftIds.join(",")}
                onChange={event => {
                    onChange({ pair, nftIds: event.target.value.split(",") })
                }} />
        </div>
    )
}

export default PairSwapSpecific