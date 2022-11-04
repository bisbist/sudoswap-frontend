import React from 'react';
import PoolCreator from '../components/PoolCreator';
import PoolsTable from '../components/PoolsTable';

const Pools = () => {
  return (
    <React.Fragment>
      <PoolCreator />
      <PoolsTable />
    </React.Fragment>
  )
}


export default Pools;