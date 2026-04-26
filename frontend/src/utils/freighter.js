import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { NETWORK_PASSPHRASE } from "./config";

export async function isFreighterInstalled() {
  const result = await isConnected();
  return Boolean(result?.isConnected);
}

export async function connectWallet() {
  const installed = await isFreighterInstalled();

  if (!installed) {
    throw new Error("Freighter is not installed. Install the extension and refresh the page.");
  }

  const result = await requestAccess();

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.address) {
    throw new Error("Freighter did not return a wallet address.");
  }

  return result.address;
}

export async function getCurrentAddress() {
  const installed = await isFreighterInstalled();

  if (!installed) {
    return "";
  }

  const result = await getAddress();

  if (result.error) {
    throw new Error(result.error);
  }

  return result.address || "";
}

export async function getWalletNetwork() {
  const installed = await isFreighterInstalled();

  if (!installed) {
    return null;
  }

  const result = await getNetwork();

  if (result.error) {
    throw new Error(result.error);
  }

  return result;
}

export async function signTransactionWithFreighter(xdr) {
  const result = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (result.error) {
    throw new Error(result.error);
  }

  if (!result.signedTxXdr) {
    throw new Error("Freighter did not return a signed transaction.");
  }

  return result.signedTxXdr;
}

export function shortAddress(address = "") {
  if (!address) return "";
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
