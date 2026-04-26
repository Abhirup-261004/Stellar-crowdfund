import { shortAddress } from "../utils/freighter";

export default function WalletConnect({ walletAddress, onConnect, disabled }) {
  if (walletAddress) {
    return (
      <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
        {shortAddress(walletAddress)}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      disabled={disabled}
      className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brandDark"
    >
      Connect Freighter
    </button>
  );
}
