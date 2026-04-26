# stellar-crowdfund

A beginner-friendly, hackathon-ready decentralized crowdfunding platform built on Stellar.

This project lets users:

- connect a Freighter wallet
- create crowdfunding campaigns
- contribute to campaigns with a configured Stellar token
- withdraw funds when a campaign succeeds
- claim refunds when a campaign fails

The project includes:

- a Soroban smart contract written in Rust
- a React + Vite + Tailwind frontend
- Freighter wallet integration
- no backend and no database

## Project Structure

```bash
stellar-crowdfund/
├── contract/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── src/
│   │   └── lib.rs
│   └── README.md
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── postcss.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── utils/
│   ├── tailwind.config.js
│   └── vite.config.js
├── implementation.md
└── README.md
```

## Features

- wallet connection with Freighter
- campaign creation with title, description, goal, and deadline
- campaign listing with progress bars and status badges
- creator withdrawals after reaching the funding goal
- contributor refunds after failed campaigns
- clean single-page dashboard UI
- Soroban contract storage for campaigns and contributions

## Tech Stack

### Smart Contract

- Rust
- Soroban SDK

### Frontend

- React
- Vite
- Tailwind CSS
- `@stellar/stellar-sdk`
- `@stellar/freighter-api`

## How It Works

Each campaign stores:

- creator wallet address
- title
- description
- funding goal
- deadline
- amount raised
- withdrawn status

The contract enforces these rules:

- only authenticated wallets can create campaigns
- contributions must be greater than zero
- contributions are only allowed before the deadline
- only the campaign creator can withdraw
- withdrawal is only allowed when the goal is reached
- refunds are only allowed after the deadline if the goal was not reached
- a campaign cannot be withdrawn twice
- a contributor cannot refund more than they contributed

## Important Soroban Note

For practical wallet authorization, the write methods accept the acting wallet address explicitly:

- `create_campaign(creator, title, description, goal, deadline)`
- `contribute(contributor, campaign_id, amount)`
- `withdraw(creator, campaign_id)`
- `refund(contributor, campaign_id)`

This is intentional so the contract can call `require_auth()` on the provided `Address`.

## Quick Start

## Deployed Testnet IDs

These are the contract IDs currently used in this project setup:

- Crowdfund contract: `CBMLFWMDARFYLFOHFTXUL2DYVPTOQK2TWEGEX2VXCAPH2RM4CNIL77I5`
- Native XLM token contract: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

If you redeploy the contract, update the frontend `.env` and this README with the new value.

### 1. Build the contract

```bash
cd contract
rustup target add wasm32v1-none
cargo build --target wasm32v1-none --release
```

### 2. Deploy the contract to testnet

```bash
stellar keys generate alice --network testnet --fund

stellar contract deploy \
  --wasm target/wasm32v1-none/release/stellar_crowdfund.wasm \
  --source-account alice \
  --network testnet \
  --alias stellar_crowdfund
```

### 3. Get the native XLM asset contract ID

```bash
stellar contract id asset --network testnet --asset native
```

### 4. Initialize the contract

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

### 5. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

Fill `.env` with:

```env
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_CONTRACT_ID=CBMLFWMDARFYLFOHFTXUL2DYVPTOQK2TWEGEX2VXCAPH2RM4CNIL77I5
VITE_TOKEN_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### 6. Run the frontend

```bash
npm run dev
```

## Example Campaign

- Title: `Solar Lights for Rural Schools`
- Description: `We are raising funds to install solar-powered study lights in 3 rural schools so students can safely study in the evening.`
- Goal: `1000`
- Deadline: any future date and time

## Environment Variables

The frontend uses these variables:

- `VITE_SOROBAN_RPC_URL`
- `VITE_NETWORK_PASSPHRASE`
- `VITE_CONTRACT_ID`
- `VITE_TOKEN_CONTRACT_ID`

Do not commit your real `.env` file to GitHub.

## Common Issues

### Freighter not installed

Install the Freighter extension and refresh the page.

### Wrong network selected

Make sure both the frontend and Freighter use:

```text
Test SDF Network ; September 2015
```

### Contract call failing

Check:

- the contract is deployed
- the contract was initialized with a valid token contract ID
- the wallet is on the correct network
- the campaign deadline and goal rules are valid

### Refund or withdraw not working

Check:

- withdraw is only for the campaign creator
- refund is only for contributors
- the campaign must be successful to withdraw
- the campaign must be failed and expired to refund

## Documentation

- Smart contract details: [contract/README.md](./contract/README.md)
- Full setup walkthrough: [implementation.md](./implementation.md)

## Future Improvements

- milestone-based crowdfunding
- campaign categories
- donor leaderboard
- NFT contributor badges
- IPFS images and campaign media
- multi-token support
- creator reputation system

## License

This project is provided as an MVP starter for learning and hackathon use.
