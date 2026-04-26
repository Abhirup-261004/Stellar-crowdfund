export const RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";

export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || "";

export const TOKEN_CONTRACT_ID = import.meta.env.VITE_TOKEN_CONTRACT_ID || "";

export const TOKEN_LABEL = TOKEN_CONTRACT_ID ? "Configured token" : "Configured token / XLM SAC";
