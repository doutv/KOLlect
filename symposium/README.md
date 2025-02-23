# Symposium Smart Contract

A decentralized voting system where users can create proposals, share opinions, and earn rewards based on voting outcomes.

## Setup

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Install dependencies:
```bash
forge install
```

3. Set up environment:
```bash
cp .env.example .env
```
Edit `.env` with your values:
- Add your wallet's private key
- Add RPC URL from Alchemy/Infura
- (Optional) Add Etherscan API key for verification

## Testing

Run tests:
```bash
forge test
```

With verbosity:
```bash
forge test -vvv
```

## Deployment

1. Deploy contract:
```bash
forge script script/Symposium.s.sol:SymposiumScript \
--fork-url $RPC_URL \
--private-key $PRIVATE_KEY \
--broadcast
```

2. Verify contract:
```bash
forge verify-contract \
$CONTRACT_ADDRESS \
src/Symposium.sol:Symposium \
--verifier custom \
--verifier-url $SONICSCAN_URL \
--verifier-api-key $SONICSCAN_API_KEY
```

## Contract Usage

1. Create a proposal:
   - Call `createProposal` with details and duration

2. Create an opinion:
   - Send 0.1 ETH with `createOpinion`
   - Include your vote (yes/no) and reasoning

3. Vote for existing opinion:
   - Send 0.1 ETH with `voteForOpinion`
   - Specify the opinion index

4. After proposal expires:
   - Anyone can call `finalizeProposal`
   - Winners can claim rewards with `claimReward`
