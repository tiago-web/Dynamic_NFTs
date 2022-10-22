import { useState } from "react";

import Modal from "../Modal";
import { useAccount } from "../../contexts/AccountContext";

import "./styles.css";

const ConnectWallet: React.FC = () => {
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const { accountAddress, connectWallet, disconnectWallet } = useAccount();

  return (
    <>
      {!accountAddress ? (
        <button className="connect-wallet" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <button
          className="connect-wallet"
          onClick={() => {
            setShowDisconnectModal(true);
          }}
        >
          {accountAddress.slice(0, 5) +
            "..." +
            accountAddress.slice(
              accountAddress.length - 4,
              accountAddress.length
            )}
        </button>
      )}

      <Modal
        open={showDisconnectModal}
        onClose={() => {
          setShowDisconnectModal(false);
        }}
      >
        <div className="disconnect-wallet-container">
          <p>
            <strong>Connected Wallet:</strong> {accountAddress}
          </p>
          <button
            onClick={() => {
              disconnectWallet();
              setShowDisconnectModal(false);
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ConnectWallet;
