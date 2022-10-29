import React from 'react';
import './App.css';
import WalletCardEthers from './WalletCardEthers';

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
      <WalletCardEthers/>
    </div>
  );
}

export default App;
