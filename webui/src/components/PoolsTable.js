import React from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import config from '../config';

const PoolsTable = ({
  onPairClick
}) => {

  const [pairs, setPairs] = React.useState([]);

  React.useEffect(() => {
    fetch('/pairs')
      .then(results => results.json())
      .then(async pairs => {
        const provider = new ethers.providers.JsonRpcProvider(config.chain.rpcUrl);
        const newPairs = await Promise.all(pairs.map(async pair => {          
          return {
            ...pair,
            balance: ethers.utils.formatEther(pair.ethBalance),
            delta: ethers.utils.formatEther(pair.delta),
            fee: ethers.utils.formatEther(pair.fee),
            spotPrice: ethers.utils.formatEther(pair.spotPrice),
            poolType: pair.poolType == "0" ? "TOKEN" : pair.poolType == "1" ? "NFT" : "TRADE",
          }
        }))
        setPairs(newPairs);
      });

  }, []);

  return (
    <div style={{ overflow: 'auto' }}>
      <table style={{ padding: 5 }}>
        <thead>
          <tr>
            <th>Block</th>
            <th>Pair</th>
            <th>Balance</th>
            <th>Spot Price</th>
            <th>Delta</th>
            <th>Fee</th>
            <th>Type</th>
            <th>NFT</th>
            <th>Bonding Curve</th>
            <th>Asset Recipient</th>
            <th>TxHash</th>
            <th>TxIndex</th>
            <th>LogIndex</th>
          </tr>
        </thead>
        <tbody>
          {
            pairs.map((pair, index) => {
              return (
                <tr key={index}>
                  <td>{pair.blockNumber}</td>
                  <td
                    style={{ cursor: 'pointer' }}
                    onClick={event => {
                      onPairClick(pair)
                    }}>
                    <tt>{pair.id}</tt>
                  </td>
                  <td>{pair.balance}</td>
                  <td>{pair.spotPrice}</td>
                  <td>{pair.delta}</td>
                  <td>{pair.fee}</td>
                  <td>{pair.poolType}</td>
                  <td><tt>{pair.nft}</tt></td>
                  <td><tt>{pair.bondingCurve}</tt></td>
                  <td><tt>{pair.assetRecipient}</tt></td>
                  <td><tt>{pair.txHash}</tt></td>
                  <td>{pair.txIndex}</td>
                  <td>{pair.logIndex}</td>
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