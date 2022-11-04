import './App.css';
import WalletCardEthers from './WalletCardEthers';
// import Navbar from './components/NavBar';
import Swap from './pages/swap'
import Pools from './pages/pools'
import { 
  BrowserRouter, 
  Routes, 
  Route,
  Link,
} from 'react-router-dom';
// import { Nav } from 'react-bootstrap';

const Home = () => <div/>

function App() {
  //const [text, setText] = React.useState(null);
  
  // React.useEffect(() => {
  //   fetch('/api')
  //     .then(results => results.text())
  //     .then(text => {
  //       setText(text);
  //     });
  // }, []);

  return (
    <div className="App">

      <BrowserRouter>

        <Link to='/swap'>Swap</Link>
        <Link to='/pools'>Pools</Link>

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
