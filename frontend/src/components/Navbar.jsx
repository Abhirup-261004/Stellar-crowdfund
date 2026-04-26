import WalletConnect from "./WalletConnect";

export default function Navbar({ walletAddress, onConnect, isActionLoading }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
            Stellar Soroban MVP
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            stellar-crowdfund
          </h1>
        </div>

        <WalletConnect
          walletAddress={walletAddress}
          onConnect={onConnect}
          disabled={isActionLoading}
        />
      </div>
    </header>
  );
}
