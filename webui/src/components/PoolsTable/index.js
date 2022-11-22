import React from 'react';
import { ethers } from 'ethers';

//Table
import PaginatedTable from '../PaginatedTable';
import { Box } from '@mui/material';



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
    
  const columns = [
    { id: 'blockNumber', label: 'Block', minWidth: 80, align: 'center'
},
    { id: 'id', label: 'Pair', minWidth: 100,align: 'center', onClick: onPairClick
},
    {
      id: 'balance',
      label: 'Balance',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'spotPrice',
      label: 'Spot Price',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'delta',
      label: 'Delta',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'fee',
      label: 'Fee',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'poolType',
      label: 'Type',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'nft',
      label: 'NFT',
      minWidth: 170,
      align: 'center',
    },
    {
      id: 'bondingCurve',
      label: 'Bonding Curve',
      minWidth: 170,
      align: 'center',
    },
    {
      id: 'assetRecipient',
      label: 'Asset Recipient',
      minWidth: 170,
      align: 'center',
    },
    {
      id: 'txHash',
      label: 'TxHash',
      minWidth: 170,
      align: 'center',
    },
    {
      id: 'txIndex',
      label: 'TxIndex',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'logIndex',
      label: 'LogIndex',
      minWidth: 80,
      align: 'center',
    },

  ];
  

  return (
      <Box p={4} mt={5}>
      <PaginatedTable data={pairs} columns={columns} />
      </Box>
  );
};

export default PoolsTable