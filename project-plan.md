# Symposium dApp Development Plan

## Overview
This document outlines the plan to develop a decentralized application (dApp) that interacts with the Symposium smart contract. The dApp will allow users to create proposals, submit opinions, vote on existing opinions, and claim rewards for winning opinions.

## Smart Contract Analysis

The Symposium smart contract provides the following key functionality:

- **Proposal Creation**: Users can create new proposals with a title, details, and expiration time
- **Opinion Creation**: Users can create opinions on proposals (either supporting or opposing) with reasoning
- **Opinion Voting**: Users can vote for existing opinions by paying a fixed amount (0.1 ETH)
- **Proposal Finalization**: After a proposal expires, it can be finalized to determine winners
- **Reward Claiming**: Users on the winning side can claim rewards based on their contribution

## Technical Stack

- **Frontend**: Next.js with TypeScript
- **Web3 Integration**: ethers.js and wagmi
- **UI Components**: Existing UI components in the frontend directory
- **Authentication**: Wallet connection via MetaMask and other providers
- **State Management**: React Context API (replacing existing mock ProposalsContext with blockchain data)

## Current Application Structure

The existing application already has a well-structured frontend with:

- Next.js App Router structure (`/app` directory)
- UI components in the `/components` directory
- Context API for proposal state management
- Tailwind CSS for styling

However, the current implementation uses **mock data** instead of real blockchain data. The main changes needed will be:

1. Adding Web3 wallet connection
2. Replacing the mock data with real blockchain calls
3. Implementing transaction handling and state management
4. Adding gas fee management

## Implementation Plan

### 1. Wallet Connection Integration

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install wagmi viem @web3modal/ethereum @web3modal/react
   ```

2. **Create Web3Provider**
   - Create a new file: `frontend/contexts/Web3Context.tsx`
   - Implement a Web3Provider component that wraps the application in `layout.tsx`
   - Configure supported networks, focusing on Ethereum networks

3. **Create ConnectionButton Component**
   - Create a new file: `frontend/components/wallet-connect.tsx`
   - Add the button to the header component (`frontend/components/header.tsx`)
   - Update the layout to include connection status

### 2. Smart Contract Integration

1. **Contract ABI and Config**
   - Create a new directory: `frontend/contracts`
   - Add the Symposium ABI: `frontend/contracts/SymposiumABI.json`
   - Add contract configuration: `frontend/contracts/config.ts` (addresses for different networks)

2. **Create Blockchain Service**
   - Create a new directory: `frontend/lib/blockchain`
   - Implement services for contract interaction:
     - `frontend/lib/blockchain/symposium.ts` - For direct contract calls
     - `frontend/lib/blockchain/proposals.ts` - For proposal-specific logic
     - `frontend/lib/blockchain/opinions.ts` - For opinion and voting logic

3. **Replace ProposalsContext with Blockchain Data**
   - Update `frontend/contexts/ProposalsContext.tsx` to:
     - Fetch proposals from the blockchain
     - Use blockchain for creating proposals and opinions
     - Handle transaction states
     - Implement event listeners for real-time updates

### 3. Enhancing Existing Components

1. **Header Component** - `frontend/components/header.tsx`
   - Add wallet connection button
   - Display connected account info
   - Show network status

2. **Create Proposal Form** - `frontend/components/create-proposal-form.tsx`
   - Connect form submission to contract call
   - Add duration field (in seconds/hours/days)
   - Add transaction state feedback
   - Implement gas estimation

3. **Proposal Card** - `frontend/components/proposal-card.tsx`
   - Update to use blockchain data
   - Add expiration countdown
   - Show finalization status
   - Display real voting data

4. **Proposal Details** - `frontend/components/proposal-details.tsx`
   - Update to fetch data from blockchain
   - Add proposal finalization button (when expired)
   - Implement reward claiming UI
   - Show transaction history for the proposal

5. **Add Opinion Component** - `frontend/components/add-opinion.tsx`
   - Connect to blockchain for submission
   - Add 0.1 ETH payment handling
   - Show gas estimation
   - Update to match contract parameters

6. **Proposals List** - `frontend/components/proposals-list.tsx`
   - Fetch proposals from blockchain
   - Implement pagination
   - Add filtering options (active, expired, finalized)
   - Add sorting by different criteria

### 4. New Components to Create

1. **Transaction Status Component** - `frontend/components/transaction-status.tsx`
   - Display pending transactions
   - Show confirmation counts
   - Handle errors and retries

2. **Network Selector** - `frontend/components/network-selector.tsx`
   - Allow users to switch networks
   - Show network status
   - Handle network-related errors

3. **Reward Claim Component** - `frontend/components/claim-reward.tsx`
   - Allow users to claim rewards for finalized proposals
   - Show claimable amount
   - Display claim history

4. **Finalize Proposal Button** - `frontend/components/finalize-proposal.tsx`
   - Button to finalize expired proposals
   - Show eligibility for finalization
   - Handle finalization transaction

5. **Transaction History** - `frontend/components/transaction-history.tsx`
   - List of user's transactions
   - Filter by transaction type
   - Show status and confirmations

### 5. Data Flow Implementation

1. **Real-time Data Updates**
   - Implement event subscriptions:
   ```typescript
   // In ProposalsContext
   useEffect(() => {
     if (!contract) return;
     
     const proposalCreatedFilter = contract.filters.ProposalCreated();
     const opinionCreatedFilter = contract.filters.OpinionCreated();
     const voteCastFilter = contract.filters.VoteCast();
     
     // Listen for events and update state
     contract.on(proposalCreatedFilter, handleProposalCreated);
     contract.on(opinionCreatedFilter, handleOpinionCreated);
     contract.on(voteCastFilter, handleVoteCast);
     
     return () => {
       contract.off(proposalCreatedFilter, handleProposalCreated);
       contract.off(opinionCreatedFilter, handleOpinionCreated);
       contract.off(voteCastFilter, handleVoteCast);
     };
   }, [contract]);
   ```

2. **Optimistic Updates**
   - Update UI immediately when transactions are sent
   - Revert changes if transaction fails
   - Show proper loading/error states

3. **Caching Strategy**
   - Cache proposal data locally
   - Implement smart refresh strategies
   - Use local storage for better performance

### 6. API Structure

1. **Proposal API**
   ```typescript
   // Get all proposals
   const proposals = await symposiumContract.getProposals();
   
   // Create a new proposal
   const tx = await symposiumContract.createProposal(title, details, duration);
   await tx.wait();
   
   // Get a single proposal
   const proposal = await symposiumContract.getProposal(id);
   ```

2. **Opinion API**
   ```typescript
   // Create a new opinion
   const tx = await symposiumContract.createOpinion(
     proposalId, 
     isYes, 
     reasoning,
     { value: ethers.utils.parseEther("0.1") }
   );
   await tx.wait();
   
   // Vote for an existing opinion
   const tx = await symposiumContract.voteForOpinion(
     proposalId,
     opinionIndex,
     { value: ethers.utils.parseEther("0.1") }
   );
   await tx.wait();
   ```

3. **Rewards API**
   ```typescript
   // Finalize a proposal
   const tx = await symposiumContract.finalizeProposal(proposalId);
   await tx.wait();
   
   // Claim rewards
   const tx = await symposiumContract.claimReward(proposalId);
   await tx.wait();
   ```

### 7. Error Handling Strategy

1. **User-Friendly Error Messages**
   - Map contract error messages to user-friendly text
   - Provide guidance on how to fix issues
   - Show context-appropriate error messages

2. **Recovery Paths**
   - Allow retrying failed transactions
   - Provide alternative actions when errors occur
   - Cache form data to prevent loss

3. **Network Handling**
   - Detect wrong network and prompt to switch
   - Handle disconnection gracefully
   - Provide clear instructions for network setup

## Implementation Schedule

### Week 1: Infrastructure & Connectivity
- Set up the Web3Provider and wallet connection
- Implement contract ABI integration
- Create basic contract service
- Update layout and header with wallet connection

### Week 2: Core Data Integration
- Replace mock proposal data with blockchain data
- Update proposal creation form
- Implement opinion creation with ETH payment
- Add transaction status handling

### Week 3: Advanced Features
- Add proposal finalization functionality
- Implement reward claiming
- Create transaction history component
- Add real-time event listeners

### Week 4: Polishing & Testing
- Enhance error handling
- Improve loading states and transitions
- Add comprehensive testing
- Optimize for performance

## Immediate Next Steps

1. **Set Up Web3 Infrastructure**
   - Install required dependencies
   - Create the Web3Context
   - Implement the wallet connection component

2. **Integrate Contract Communication**
   - Generate and add the ABI
   - Create the contract service
   - Implement basic read functions

3. **Update Proposals Context**
   - Replace mock data with blockchain calls
   - Implement real-time event listeners
   - Add transaction state management

4. **Enhance Create Proposal Form**
   - Connect to blockchain
   - Add transaction feedback
   - Implement gas estimation

## Recommended File Structure for New Components

```
frontend/
├── app/                         # Next.js App Router
├── components/
│   ├── ui/                      # UI components
│   ├── wallet-connect.tsx       # Wallet connection component
│   ├── transaction-status.tsx   # Transaction status component
│   ├── network-selector.tsx     # Network selection component
│   ├── claim-reward.tsx         # Reward claiming component
│   ├── finalize-proposal.tsx    # Proposal finalization component
│   └── transaction-history.tsx  # Transaction history component
├── contexts/
│   ├── ProposalsContext.tsx     # Updated for blockchain
│   └── Web3Context.tsx          # Web3 provider context
├── contracts/
│   ├── SymposiumABI.json        # Contract ABI
│   └── config.ts                # Contract addresses
├── hooks/
│   ├── useSymposium.ts          # Contract hook
│   ├── useProposals.ts          # Proposals hook
│   └── useTransaction.ts        # Transaction management hook
└── lib/
    └── blockchain/
        ├── symposium.ts         # Contract service
        ├── proposals.ts         # Proposal service
        └── opinions.ts          # Opinion service
``` 