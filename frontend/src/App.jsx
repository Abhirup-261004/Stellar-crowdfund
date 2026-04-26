import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CreateCampaignForm from "./components/CreateCampaignForm";
import CampaignList from "./components/CampaignList";
import ContributeModal from "./components/ContributeModal";
import {
  connectWallet,
  getCurrentAddress,
  getWalletNetwork,
  shortAddress,
} from "./utils/freighter";
import {
  createCampaign,
  contribute,
  getAllCampaigns,
  getContribution,
  refund,
  withdraw,
} from "./utils/soroban";
import { NETWORK_PASSPHRASE, TOKEN_LABEL } from "./utils/config";

export default function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [contributions, setContributions] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  async function refreshData(activeWallet = walletAddress) {
    setPageLoading(true);
    setErrorMessage("");

    try {
      const readAddress = activeWallet || "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
      const allCampaigns = await getAllCampaigns(readAddress);
      setCampaigns(allCampaigns);

      if (activeWallet) {
        const nextContributions = {};

        for (const campaign of allCampaigns) {
          const amount = await getContribution(campaign.id, activeWallet, activeWallet);
          nextContributions[campaign.id] = amount;
        }

        setContributions(nextContributions);
      } else {
        setContributions({});
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to load campaigns.");
    } finally {
      setPageLoading(false);
    }
  }

  async function bootstrapWallet() {
    try {
      const existingAddress = await getCurrentAddress();
      if (existingAddress) {
        setWalletAddress(existingAddress);

        const networkInfo = await getWalletNetwork();
        setWalletNetwork(networkInfo?.networkPassphrase || "");
        await refreshData(existingAddress);
        return;
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to read Freighter wallet.");
    }

    await refreshData("");
  }

  useEffect(() => {
    bootstrapWallet();
  }, []);

  async function handleConnectWallet() {
    setErrorMessage("");
    setStatusMessage("");

    try {
      const address = await connectWallet();
      setWalletAddress(address);

      const networkInfo = await getWalletNetwork();
      setWalletNetwork(networkInfo?.networkPassphrase || "");

      if (
        networkInfo?.networkPassphrase &&
        networkInfo.networkPassphrase !== NETWORK_PASSPHRASE
      ) {
        setErrorMessage(
          "Freighter is connected to a different Stellar network. Switch Freighter to the network configured in your frontend .env file.",
        );
      }

      setStatusMessage("Wallet connected successfully.");
      await refreshData(address);
    } catch (error) {
      setErrorMessage(error.message || "Wallet connection failed.");
    }
  }

  async function handleCreateCampaign(formValues) {
    if (!walletAddress) {
      setErrorMessage("Connect Freighter before creating a campaign.");
      return;
    }

    setActionLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await createCampaign(walletAddress, formValues);
      setStatusMessage("Campaign created successfully.");
      await refreshData(walletAddress);
    } catch (error) {
      setErrorMessage(error.message || "Failed to create campaign.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleContribute(amount) {
    if (!selectedCampaign) return;

    setActionLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await contribute(walletAddress, selectedCampaign.id, amount);
      setStatusMessage("Contribution submitted successfully.");
      setSelectedCampaign(null);
      await refreshData(walletAddress);
    } catch (error) {
      setErrorMessage(error.message || "Contribution failed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleWithdraw(campaignId) {
    setActionLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await withdraw(walletAddress, campaignId);
      setStatusMessage("Funds withdrawn successfully.");
      await refreshData(walletAddress);
    } catch (error) {
      setErrorMessage(error.message || "Withdraw failed.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRefund(campaignId) {
    setActionLoading(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await refund(walletAddress, campaignId);
      setStatusMessage("Refund claimed successfully.");
      await refreshData(walletAddress);
    } catch (error) {
      setErrorMessage(error.message || "Refund failed.");
    } finally {
      setActionLoading(false);
    }
  }

  const totalCampaigns = campaigns.length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_45%,_#f8fafc_100%)] text-slate-900">
      <Navbar
        walletAddress={walletAddress}
        onConnect={handleConnectWallet}
        isActionLoading={actionLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Total campaigns</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              {totalCampaigns}
            </p>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Connected wallet</p>
            <p className="mt-2 break-all text-sm font-semibold text-slate-900">
              {walletAddress ? shortAddress(walletAddress) : "Not connected"}
            </p>
            {walletAddress && (
              <p className="mt-2 text-xs text-slate-500">
                Transactions are signed with Freighter.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Token mode</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{TOKEN_LABEL}</p>
            <p className="mt-2 text-xs text-slate-500">
              Amounts are shown in raw token units for MVP simplicity.
            </p>
          </div>
        </section>

        {walletAddress && walletNetwork && walletNetwork !== NETWORK_PASSPHRASE && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Freighter network mismatch detected. Expected:{" "}
            <span className="font-semibold">{NETWORK_PASSPHRASE}</span>
          </div>
        )}

        {statusMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 grid gap-8 lg:grid-cols-[380px,1fr]">
          <CreateCampaignForm
            onSubmit={handleCreateCampaign}
            disabled={!walletAddress || actionLoading}
          />

          <CampaignList
            campaigns={campaigns}
            walletAddress={walletAddress}
            contributions={contributions}
            isLoading={pageLoading}
            onContribute={(campaign) => setSelectedCampaign(campaign)}
            onWithdraw={handleWithdraw}
            onRefund={handleRefund}
            isActionLoading={actionLoading}
          />
        </section>
      </main>

      <ContributeModal
        isOpen={Boolean(selectedCampaign)}
        campaign={selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onSubmit={handleContribute}
        disabled={!walletAddress || actionLoading}
      />
    </div>
  );
}
