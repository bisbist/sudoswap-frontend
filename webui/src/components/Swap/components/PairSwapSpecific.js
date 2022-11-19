import React from "react"


const PairSwapSpecific = ({
    value: { pair, nftIds },
    onChange,
}) => {
    return (
        <div style={{ width: "100%", display: "flex" }}>
            <input
                style={{ flex: 1 }}
                value={pair}
                placeholder="Pair Address"
                onChange={event => {
                    onChange({ nftIds, pair: event.target.value })
                }} />
            <input
                style={{ flex: 1 }}
                value={nftIds.join(",")}
                placeholder="NFT IDs (CSV)"
                onChange={event => {
                    onChange({ pair, nftIds: event.target.value.split(",") })
                }} />
        </div>
    )
}

export default PairSwapSpecific