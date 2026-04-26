# Stellar Crowdfund Contract

This is the Soroban smart contract for the `stellar-crowdfund` project.

## What it does

The contract stores crowdfunding campaigns and contributor balances, then enforces:

- campaign creation by an authenticated wallet
- contributions before deadline only
- creator withdrawals only after goal is reached
- contributor refunds only after deadline if the goal was not reached
- no double withdrawal
- no double refund

## Important note about Soroban auth

Write methods take the acting wallet `Address` explicitly:

- `create_campaign(creator, ...)`
- `contribute(contributor, ...)`
- `withdraw(creator, campaign_id)`
- `refund(contributor, campaign_id)`

This is the practical Soroban pattern for MVP contracts because the contract needs an `Address` value in order to call `require_auth()`.

## Build

```bash
cargo build --target wasm32v1-none --release
```

## Output WASM

```bash
target/wasm32v1-none/release/stellar_crowdfund.wasm
```

## Deploy example

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_crowdfund.wasm \
  --source-account alice \
  --network testnet \
  --alias stellar_crowdfund
```

## Initialize example

Replace `<TOKEN_CONTRACT_ID>` with the Stellar Asset Contract you want to use.

For native XLM on testnet:

```bash
stellar contract id asset --network testnet --asset native
```

Then initialize:

```bash
stellar contract invoke \
  --id stellar_crowdfund \
  --source-account alice \
  --network testnet \
  --send=yes \
  -- \
  init \
  --token <TOKEN_CONTRACT_ID>
```
