import { Toaster } from "react-hot-toast";

import Navbar from "../../components/Navbar";
import AccountProvider from "../../contexts/AccountContext";
import ContractParamsProvider from "../../contexts/ContractParamsContext";

import "./styles.css";

interface AppProps {
  children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
  return (
    <AccountProvider>
      <ContractParamsProvider>
        <Navbar />
        <div className="app-container">{children}</div>
        <Toaster
          containerStyle={{
            top: "5rem",
          }}
        />
      </ContractParamsProvider>
    </AccountProvider>
  );
};

export default App;
