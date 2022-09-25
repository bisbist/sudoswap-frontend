import React from 'react';
import './App.css';

function App() {
  const [text, setText] = React.useState(null);
  
  React.useEffect(() => {
    fetch('http://localhost:8000/')
      .then(results => results.text())
      .then(text => {
        setText(text);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
          { text }
      </header>
    </div>
  );
}

export default App;
