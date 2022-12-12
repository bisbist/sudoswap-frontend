import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { setConfig } from "./config";
import Home from "./pages/Home";
import "@blueprintjs/core/lib/css/blueprint.css";

function App() {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    fetch("/config")
      .then((res) => res.json())
      .then((cfg) => {
        setConfig(cfg);
        setInitialized(true);
      });
  }, []);

  return initialized ? (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  ) : null;
}

export default App;
