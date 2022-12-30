import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { setConfig } from "./config";
import "@blueprintjs/core/lib/css/blueprint.css";
import PoolCreator from "./components/PoolCreator";
import NavBar from "./components/Navbar/Navbar";
import Swap from "./components/Swap";
import PoolsTable from "./components/NewPoolsTable";
import { Navigate } from "react-router-dom";

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
        <Route path="/" element={<Navigate to="/pools" replace />} />
        <Route
          path="/pools"
          element={[<PoolCreator key={"one"} />, <PoolsTable key={"two"} />]}
        />
        <Route path="/swap" element={<Swap />} />
      </Routes>
    </BrowserRouter>
  ) : null;
}

export default App;
