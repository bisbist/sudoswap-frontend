import React from "react"


const PairSwapSpecific = ({
    value: { pair, nftIds, flag, flagTitle },
    onChange,
}) => {
    const value = { pair, nftIds, flag, flagTitle }

    return (
        <div style={{ width: "100%", display: "flex" }}>
            <input
                style={{ flex: 1 }}
                value={pair}
                placeholder="Pair Address"
                onChange={event => {
                    onChange({ ...value, pair: event.target.value })
                }} />
            <input
                style={{ flex: 1 }}
                value={nftIds.join(",")}
                placeholder="NFT IDs (CSV)"
                onChange={event => {
                    onChange({ ...value, nftIds: event.target.value.split(",") })
                }} />
            <input
                type='checkbox'
                checked={flag}
                title={flagTitle}
                onChange={event => {
                    onChange({ ...value, flag: event.target.checked })
                }} />
        </div>
    )
}

export default PairSwapSpecific