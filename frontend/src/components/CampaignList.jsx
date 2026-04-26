import CampaignCard from "./CampaignCard";

export default function CampaignList({
  campaigns,
  walletAddress,
  contributions,
  isLoading,
  onContribute,
  onWithdraw,
  onRefund,
  isActionLoading,
}) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            Campaigns
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Live dashboard</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          No campaigns yet. Connect your wallet and create the first one.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              walletAddress={walletAddress}
              contribution={contributions[campaign.id] || "0"}
              onContribute={onContribute}
              onWithdraw={onWithdraw}
              onRefund={onRefund}
              isActionLoading={isActionLoading}
            />
          ))}
        </div>
      )}
    </section>
  );
}
