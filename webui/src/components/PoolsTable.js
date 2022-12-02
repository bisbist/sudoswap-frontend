import React from 'react'
import { ethers } from 'ethers'
import config from "../config"


export const Type = {
    TOKEN: "0",
    NFT: "1",
    TRADE: "2",
}

export const Variant = {
    ENUMERABLE_ETH: "0",
    MISSING_ENUMERABLE_ETH: "1",
    ENUMERABLE_ERC20: "2",
    MISSING_ENUMERABLE_ERC20: "3"
}

const PoolsTable = ({
    onPairClick
}) => {

    const [pairs, setPairs] = React.useState([]);

    React.useEffect(() => {
        fetch('/pairs')
            .then(results => results.json())
            .then(async pairs => {
                const newPairs = await Promise.all(pairs.map(async pair => {
                    return {
                        ...pair,
                        variant: pair.variant === Variant.ENUMERABLE_ETH ? "ETH_ENUM" :
                            pair.variant === Variant.MISSING_ENUMERABLE_ETH ? "ETH" :
                                pair.variant === Variant.ENUMERABLE_ERC20 ? "ERC20_ENUM" :
                                    pair.variant === Variant.MISSING_ENUMERABLE_ERC20 ? "ERC20" : "UNKNOWN",
                        ethBalance: pair.ethBalance ? ethers.utils.formatEther(pair.ethBalance) : "",
                        tokenBalance: pair.tokenBalance ? ethers.utils.formatEther(pair.tokenBalance) : "",
                        delta: pair.delta ? ethers.utils.formatEther(pair.delta) : "",
                        fee: pair.fee ? ethers.utils.formatEther(pair.fee) : "",
                        spotPrice: pair.spotPrice ? ethers.utils.formatEther(pair.spotPrice) : "",
                        poolType: pair.poolType === Type.TOKEN ? "TOKEN" :
                            pair.poolType === Type.NFT ? "NFT" :
                                pair.poolType === Type.TRADE ? "TRADE" : "UNKNOWN",
                        txValue: pair.txValue ? ethers.utils.formatEther(pair.txValue) : "",
                        txGasPrice: pair.txGasPrice ? ethers.utils.formatUnits(pair.txGasPrice, "gwei") + "gwei" : "",
                        txMaxFeePerGas: pair.txMaxFeePerGas ? ethers.utils.formatUnits(pair.txMaxFeePerGas, "gwei") + "gwei" : "",
                        txMaxPriorityFeePerGas: pair.txMaxPriorityFeePerGas ? ethers.utils.formatUnits(pair.txMaxPriorityFeePerGas, "gwei") + "gwei" : "",
                        timestamp: new Date(parseInt(pair.timestamp) * 1000).toLocaleString()
                    }
                }))
                setPairs(newPairs);
            });

    }, []);

    return (
        <div style={{ overflow: 'auto' }}>
            <table style={{ padding: 10 }}>
                <thead>
                    <tr>
                        <th style={{ minWidth: 200 }}>Time</th>
                        <th>Block</th>
                        <th>Address</th>
                        <th>Variant</th>
                        <th>ETH Balance</th>
                        <th>Token</th>
                        <th>Token Balance</th>
                        <th>Spot Price</th>
                        <th>Delta</th>
                        <th>Fee</th>
                        <th>Type</th>
                        <th>NFT</th>
                        <th>Owner</th>
                        <th>Bonding Curve</th>
                        <th>Asset Recipient</th>
                        <th>LogIndex</th>
                        <th>TxType</th>
                        <th>TxHash</th>
                        <th>TxIndex</th>
                        <th>TxValue</th>
                        <th>TxNonce</th>
                        <th>TxGasLimit</th>
                        <th>TxGasPrice</th>
                        <th>TxMaxFeePerGas</th>
                        <th>TxMaxPriorityFeePerGas</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        pairs.map((pair, index) => {
                            return (
                                <tr key={index}>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.timestamp}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.blockNumber}</td>
                                    <td
                                        style={{ padding: "0 10px 0 10px", cursor: 'pointer' }}
                                        onClick={event => {
                                            onPairClick(pair.address)
                                        }}>
                                        <tt>{pair.address}</tt>
                                    </td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.variant}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.ethBalance}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.token}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.tokenBalance}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.spotPrice}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.delta}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.fee}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.poolType}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.nft}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.owner}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.bondingCurve}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.assetRecipient}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.logIndex}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.txType}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}><tt>{pair.txHash}</tt></td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txIndex}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txValue}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txNonce}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txGasLimit}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txGasPrice}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txMaxFeePerGas}</td>
                                    <td style={{ padding: "0 10px 0 10px" }}>{pair.txMaxPriorityFeePerGas}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
};

export default PoolsTable