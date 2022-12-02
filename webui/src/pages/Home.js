import React from 'react';
import Swap from '../components/Swap';
import PoolCreator from '../components/PoolCreator';
import PoolsTable from '../components/PoolsTable';


const Home = () => {
  const [ pairAddress, setPairAddress ] = React.useState([])

  return (
    <React.Fragment>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
        <PoolCreator />
        <Swap />
      </div>

      <PoolsTable
        onPairClick={address => {
          setPairAddress(address)
        }} />

    </React.Fragment>
  )
}


export default Home;