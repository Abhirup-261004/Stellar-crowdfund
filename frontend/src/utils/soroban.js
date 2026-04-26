import {
  BASE_FEE,
  Operation,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from "./config";
import { signTransactionWithFreighter } from "./freighter";

const server = new rpc.Server(RPC_URL);

function ensureConfig() {
  if (!CONTRACT_ID) {
    throw new Error("Missing VITE_CONTRACT_ID in your frontend .env file.");
  }
}

function ensureWallet(walletAddress) {
  if (!walletAddress) {
    throw new Error("Connect Freighter before calling the contract.");
  }
}

async function buildBaseTransaction(sourceAddress, operation) {
  const account = await server.getAccount(sourceAddress);

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}

function parseScValXdr(value) {
  // The Stellar SDK already returns `retval` as an xdr.ScVal object for
  // simulated transactions. If we parse it again as base64, the SDK throws
  // errors like "Bad union switch: 4".
  const scVal =
    typeof value === "string" ? xdr.ScVal.fromXDR(value, "base64") : value;

  return scValToNative(scVal);
}

function normalizeCampaign(rawCampaign) {
  if (!rawCampaign) return null;

  return {
    id: Number(rawCampaign.id),
    creator: String(rawCampaign.creator),
    title: String(rawCampaign.title),
    description: String(rawCampaign.description),
    goal: String(rawCampaign.goal),
    deadline: Number(rawCampaign.deadline),
    raised: String(rawCampaign.raised),
    withdrawn: Boolean(rawCampaign.withdrawn),
  };
}

function friendlyRpcError(error) {
  const message = error?.message || "Unknown RPC error";

  if (message.includes("Missing VITE_CONTRACT_ID")) return message;
  if (message.includes("not found")) {
    return "Account or contract was not found on the selected network.";
  }
  if (message.includes("txBadAuth")) {
    return "Transaction authorization failed. Make sure the connected wallet signed the transaction.";
  }
  if (message.includes("Error(Contract")) {
    return "The contract rejected this action. Double-check the campaign rules and token setup.";
  }

  return message;
}

async function simulateRead(sourceAddress, functionName, args = []) {
  ensureConfig();
  ensureWallet(sourceAddress);

  const tx = await buildBaseTransaction(
    sourceAddress,
    Operation.invokeContractFunction({
      contract: CONTRACT_ID,
      function: functionName,
      args,
    }),
  );

  const simulation = await server.simulateTransaction(tx);

  if ("error" in simulation && simulation.error) {
    throw new Error(simulation.error);
  }

  const resultXdr = simulation?.result?.retval || simulation?.results?.[0]?.retval;

  if (!resultXdr) {
    throw new Error("Simulation did not return a value.");
  }

  return parseScValXdr(resultXdr);
}

async function submitWrite(sourceAddress, functionName, args = []) {
  ensureConfig();
  ensureWallet(sourceAddress);

  try {
    const tx = await buildBaseTransaction(
      sourceAddress,
      Operation.invokeContractFunction({
        contract: CONTRACT_ID,
        function: functionName,
        args,
      }),
    );

    const prepared = await server.prepareTransaction(tx);
    const signedXdr = await signTransactionWithFreighter(prepared.toXDR());
    const signedTx = new Transaction(signedXdr, NETWORK_PASSPHRASE);

    const sendResponse = await server.sendTransaction(signedTx);

    if (sendResponse.errorResultXdr) {
      throw new Error("Transaction submission failed before confirmation.");
    }

    if (!sendResponse.hash) {
      return sendResponse;
    }

    return await waitForTransaction(sendResponse.hash);
  } catch (error) {
    throw new Error(friendlyRpcError(error));
  }
}

async function waitForTransaction(hash) {
  for (let index = 0; index < 15; index += 1) {
    const tx = await server.getTransaction(hash);

    if (tx.status === "SUCCESS") {
      return tx;
    }

    if (tx.status === "FAILED") {
      throw new Error("Transaction failed on-chain.");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error("Transaction is still pending. Check your wallet and RPC status.");
}

export async function getCampaignCount(sourceAddress) {
  const value = await simulateRead(sourceAddress, "get_campaign_count");
  return Number(value);
}

export async function getCampaign(campaignId, sourceAddress) {
  const rawCampaign = await simulateRead(sourceAddress, "get_campaign", [
    nativeToScVal(campaignId, { type: "u32" }),
  ]);

  return normalizeCampaign(rawCampaign);
}

export async function getContribution(campaignId, contributor, sourceAddress) {
  const value = await simulateRead(sourceAddress, "get_contribution", [
    nativeToScVal(campaignId, { type: "u32" }),
    nativeToScVal(contributor, { type: "address" }),
  ]);

  return String(value);
}

export async function getAllCampaigns(sourceAddress) {
  const count = await getCampaignCount(sourceAddress);
  const campaigns = [];

  for (let index = 0; index < count; index += 1) {
    const campaign = await getCampaign(index, sourceAddress);
    campaigns.push(campaign);
  }

  return campaigns;
}

export async function createCampaign(walletAddress, formValues) {
  return submitWrite(walletAddress, "create_campaign", [
    nativeToScVal(walletAddress, { type: "address" }),
    nativeToScVal(formValues.title, { type: "string" }),
    nativeToScVal(formValues.description, { type: "string" }),
    nativeToScVal(BigInt(formValues.goal), { type: "i128" }),
    nativeToScVal(BigInt(formValues.deadline), { type: "u64" }),
  ]);
}

export async function contribute(walletAddress, campaignId, amount) {
  return submitWrite(walletAddress, "contribute", [
    nativeToScVal(walletAddress, { type: "address" }),
    nativeToScVal(campaignId, { type: "u32" }),
    nativeToScVal(BigInt(amount), { type: "i128" }),
  ]);
}

export async function withdraw(walletAddress, campaignId) {
  return submitWrite(walletAddress, "withdraw", [
    nativeToScVal(walletAddress, { type: "address" }),
    nativeToScVal(campaignId, { type: "u32" }),
  ]);
}

export async function refund(walletAddress, campaignId) {
  return submitWrite(walletAddress, "refund", [
    nativeToScVal(walletAddress, { type: "address" }),
    nativeToScVal(campaignId, { type: "u32" }),
  ]);
}
