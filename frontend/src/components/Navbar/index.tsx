import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import ConnectWallet from "../ConnectWallet";

import "./styles.css";

const Navbar: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState("");
  const location = useLocation();

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);

  return (
    <div className="navbar-container">
      <div className="logo">
        <Link to="/">Dynamic NFTs</Link>
      </div>
      <div className="links">
        <Link to="/" className={activeRoute === "/" ? "active" : ""}>
          My NFT(s)
        </Link>
        <Link
          to="/mint-nft"
          className={activeRoute === "/mint-nft" ? "active" : ""}
        >
          Mint NFT(s)
        </Link>
      </div>

      <ConnectWallet />
    </div>
  );
};

export default Navbar;
