import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import Swap from './pages/swap'
import Pools from './pages/pools'

const Home = () => <div />

function App() {

  return (
    <div>

      <BrowserRouter>

        <div style={{ textAlign: 'center' }}>
          <Link to='/swap'>
            <button style={{ margin: 5, padding: 5 }}>Swap</button>
          </Link>
          <Link to='/pools'>
            <button style={{ margin: 5, padding: 5 }}>Pools</button>
          </Link>
        </div>

        <Routes>
          <Route path='/swap' element={<Swap />} />
          <Route path='/pools' element={<Pools />} />
          <Route path='/' element={<Home />} />
        </Routes>

      </BrowserRouter>

    </div>

  );
}

export default App;