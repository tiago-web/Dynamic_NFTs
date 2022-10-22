import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import "@typechain/hardhat";
import "solidity-coverage";

import "./tasks";

const PRIVATE_KEY =
    process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key";
const REPORT_GAS = process.env.REPORT_GAS || false;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://rpc.ankr.com/eth_goerli";

module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
        version: "0.8.8",
        settings: {
            optimizer: {
                enabled: true,
                runs: 1,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 1337,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            gasPrice: 130000000000,
            gas: 6700000,
            chainId: 1337,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            saveDeployments: true,
            blockConfirmations: 2,
            accounts: [PRIVATE_KEY],
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        alice: {
            default: 1,
        },
        bob: {
            default: 2,
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: REPORT_GAS,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    contractSizer: {
        runOnCompile: false,
        only: ["Raffle"],
    },
    mocha: {
        timeout: 500000, // 500 seconds max for running tests
    },
};
