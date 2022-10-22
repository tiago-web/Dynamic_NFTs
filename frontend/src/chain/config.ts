import digitalAbi from "./abis/DigitalNft.json";

export const digitalNftAddress =
  import.meta.env.VITE_BLOCKCHAIN_ADDRESS_DIGITAL_TOKEN ||
  "0xC899abF512E21C5f1F5B8dA4dF27c576FB360B6d";
export const digitalNftAbi = digitalAbi;

export const blockchainParams = {
  chainId: import.meta.env.VITE_BLOCKCHAIN_ID || "0x539",
  chainName: import.meta.env.VITE_BLOCKCHAIN_NAME,
  nativeCurrency: {
    name: import.meta.env.VITE_BLOCKCHAIN_CURRENCY_NAME,
    symbol: import.meta.env.VITE_BLOCKCHAIN_CURRENCY_SYMBOL,
    decimals: +import.meta.env.VITE_BLOCKCHAIN_DECIMALS!!,
  },
  rpcUrls: [import.meta.env.VITE_BLOCKCHAIN_RPC_URL],
  blockExplorerUrls: [import.meta.env.VITE_BLOCKCHAIN_EXPLORER_URL],
};
