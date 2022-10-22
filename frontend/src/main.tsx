import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./pages/App";
import MyNFTs from "./pages/MyNFTs";
import MintNFT from "./pages/MintNFT";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<MyNFTs />} />
          <Route path="/mint-nft" element={<MintNFT />} />
        </Routes>
      </App>
    </Router>
  </StrictMode>
);
