import StatusBadge from "./StatusBadge";
import { shortAddress } from "../utils/freighter";

function formatDate(timestamp) {
  if (!timestamp) return "Unknown";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

function getCampaignState(campaign) {
  const now = Math.floor(Date.now() / 1000);
  const goalReached = BigInt(campaign.raised) >= BigInt(campaign.goal);
  const deadlinePassed = now >= Number(campaign.deadline);

  if (campaign.withdrawn) return "Withdrawn";
  if (goalReached) return "Successful";
  if (deadlinePassed) return "Failed";
  return "Active";
}

export default function CampaignCard({
  campaign,
  walletAddress,
  contribution,
  onContribute,
  onWithdraw,
  onRefund,
  isActionLoading,
}) {
  const state = getCampaignState(campaign);
  const raised = Number(campaign.raised || 0);
  const goal = Number(campaign.goal || 0);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const isCreator =
    walletAddress &&
    walletAddress.toUpperCase() === String(campaign.creator).toUpperCase();

  const canWithdraw = isCreator && state === "Successful" && !campaign.withdrawn;
  const canRefund = walletAddress && state === "Failed" && Number(contribution) > 0;
  const canContribute = state === "Active" && walletAddress;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{campaign.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{campaign.description}</p>
        </div>

        <StatusBadge status={state} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-900">Creator:</span>{" "}
          {shortAddress(campaign.creator)}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Goal:</span> {campaign.goal}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Raised:</span> {campaign.raised}
        </p>
        <p>
          <span className="font-semibold text-slate-900">Deadline:</span>{" "}
          {formatDate(campaign.deadline)}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{progress.toFixed(1)}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-cyan-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {walletAddress && (
        <p className="mt-4 text-xs text-slate-500">
          Your contribution: <span className="font-semibold text-slate-700">{contribution}</span>
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onContribute(campaign)}
          disabled={!canContribute || isActionLoading}
          className="rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brandDark"
        >
          Contribute
        </button>

        {canWithdraw && (
          <button
            type="button"
            onClick={() => onWithdraw(campaign.id)}
            disabled={isActionLoading}
            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Withdraw
          </button>
        )}

        {canRefund && (
          <button
            type="button"
            onClick={() => onRefund(campaign.id)}
            disabled={isActionLoading}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            Refund
          </button>
        )}
      </div>
    </article>
  );
}
