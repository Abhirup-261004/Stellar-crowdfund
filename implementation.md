# stellar-crowdfund Implementation Guide

This guide walks you from zero to a working Soroban crowdfunding demo.

## Step 1: Prerequisites

Install these first:

- Rust
- Node.js 18+
- npm
- Freighter wallet browser extension
- Stellar CLI

Useful checks:

```bash
rustc --version
cargo --version
node --version
npm --version
stellar --version
```

## Step 2: Install Soroban CLI

The current tool is `stellar-cli`.

### macOS / Linux with Homebrew

```bash
brew install stellar-cli
```

### macOS / Linux with install script

```bash
curl -fsSL https://github.com/stellar/stellar-cli/raw/main/install.sh | sh
```

### Windows with winget

```bash
winget install --id Stellar.StellarCLI
```

After install:

```bash
stellar --version
```

## Step 3: Setup Stellar testnet identity

Generate a funded testnet identity:

```bash
stellar keys generate alice --network testnet --fund
```

Show the address:

```bash
stellar keys address alice
```

You can also create a second account later for testing contributions and refunds.

## Step 4: Build the contract

Go to the contract folder:

```bash
cd contract
```

Add the WASM build target if you do not already have it:

```bash
rustup target add wasm32v1-none
```

Build the contract:

```bash
cargo build --target wasm32v1-none --release
```

Your compiled file will be:

```bash
target/wasm32v1-none/release/stellar_crowdfund.wasm
```

## Step 5: Deploy the contract

Deploy the compiled contract to Stellar testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_crowdfund.wasm \
  --source-account alice \
  --network testnet \
  --alias stellar_crowdfund
```

This returns the deployed contract ID.

You can also look up the alias later:

```bash
stellar contract id stellar_crowdfund
```

If your CLI version does not support that alias lookup command, just save the returned `C...` contract ID manually.

## Step 6: Initialize contract with token address

The crowdfund contract needs a token contract address.

### Option A: Use native XLM on testnet through its Stellar Asset Contract

Get the native asset contract ID:

```bash
stellar contract id asset --network testnet --asset native
```

Copy the returned contract ID.

### Initialize the crowdfund contract

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

Replace `<TOKEN_CONTRACT_ID>` with the XLM asset contract ID or another token contract.

## Step 7: Setup frontend

Open the frontend folder:

```bash
cd ../frontend
```

Install dependencies:

```bash
npm install
```

Create your env file:

```bash
cp .env.example .env
```

Fill in:

- `VITE_SOROBAN_RPC_URL`
- `VITE_NETWORK_PASSPHRASE`
- `VITE_CONTRACT_ID`
- optional `VITE_TOKEN_CONTRACT_ID`

Example testnet values:

```env
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_CONTRACT_ID=YOUR_DEPLOYED_CONTRACT_ID
VITE_TOKEN_CONTRACT_ID=YOUR_TOKEN_CONTRACT_ID
```

Start the frontend:

```bash
npm run dev
```

Open the local Vite URL in your browser.

## Step 8: Connect Freighter

In the app:

1. Click `Connect Freighter`
2. Approve access in the extension
3. Make sure Freighter is on the same network as your frontend env
4. Confirm your address appears in the navbar

Important:
If Freighter is on the wrong network, the app will warn you.

## Step 9: Create a campaign

After connecting your wallet:

1. Fill in title
2. Fill in description
3. Enter a goal in raw token units
4. Pick a future deadline
5. Click `Create Campaign`
6. Approve the transaction in Freighter

After success, the campaign list refreshes automatically.

## Step 10: Contribute to a campaign

Before contributing, the wallet must hold the configured token.

For testnet XLM-style flows, use testnet accounts funded with Friendbot and ensure your token path is correct for your selected asset contract.

In the UI:

1. Click `Contribute`
2. Enter the amount
3. Confirm in Freighter
4. Wait for the success message
5. The campaign card refreshes with the new raised amount

## Step 11: Withdraw or refund

### Withdraw

The campaign creator can withdraw only if:

- the goal has been reached
- the campaign has not already been withdrawn

In the UI:

1. Connect as the creator wallet
2. Click `Withdraw`
3. Approve in Freighter

### Refund

A contributor can refund only if:

- the deadline has passed
- the goal was not reached
- the contributor has a non-zero contribution

In the UI:

1. Connect as a contributing wallet
2. Click `Refund`
3. Approve in Freighter

## Step 12: Troubleshoot common issues

### Freighter not installed

Install the Freighter browser extension and refresh the page.

### Wrong Stellar network selected

Your frontend and Freighter must use the same network passphrase.

For testnet use:

```text
Test SDF Network ; September 2015
```

### Invalid contract ID

Double-check the deployed contract address in your `.env` file.

### Token contract not initialized

If `init` was not called, contribution and withdraw flows will fail.
Run the contract `init` step first.

### Wallet has no test funds

Fund your testnet account:

```bash
stellar keys generate bob --network testnet --fund
```

### Contribution transaction failing

Common causes:

- campaign deadline already passed
- amount is zero or negative
- wallet is on wrong network
- token contract address is wrong
- contributor has insufficient token balance

### Withdraw failing

Common causes:

- caller is not the campaign creator
- goal has not been reached yet
- campaign was already withdrawn

### Refund failing

Common causes:

- deadline has not passed yet
- campaign already reached the goal
- wallet did not contribute to that campaign
- refund was already claimed earlier

### RPC URL issues

Use a valid Soroban RPC endpoint, such as:

```text
https://soroban-testnet.stellar.org
```

If the endpoint is unavailable, try again later or switch to another valid RPC provider.
