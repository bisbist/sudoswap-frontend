import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { setConfig } from "./config";
import Home from "./pages/Home";
import "@blueprintjs/core/lib/css/blueprint.css";
import PoolCreator from "./components/PoolCreator";
import NavBar from "./components/Navbar/Navbar";
import Swap from "./components/Swap";
import PoolsTable from "./components/NewPoolsTable";

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
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pools" element={[<PoolCreator />, <PoolsTable/>]} />
        <Route path="/swap" element={<Swap />} />
      </Routes>
    </BrowserRouter>
  ) : null;
}

export default App;
