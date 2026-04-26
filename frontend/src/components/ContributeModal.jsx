import { useEffect, useState } from "react";

export default function ContributeModal({
  isOpen,
  campaign,
  onClose,
  onSubmit,
  disabled,
}) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
    }
  }, [isOpen]);

  if (!isOpen || !campaign) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(amount.trim());
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
            Contribute
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">{campaign.title}</h3>
          <p className="mt-2 text-sm text-slate-500">
            Enter your contribution in raw token units.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="mb-2 block text-sm font-medium text-slate-700">Amount</label>
          <input
            required
            min="1"
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="100"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand"
          />

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={disabled}
              className="flex-1 rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brandDark"
            >
              Confirm Contribution
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
