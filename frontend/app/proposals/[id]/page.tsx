const handleVote = async (opinionIndex: number) => {
  if (!walletClient || !address || !contractAddress) {
    setStatus({ type: 'error', message: 'Wallet not connected' });
    return;
  }

  try {
    setStatus({ type: 'pending', message: 'Submitting vote...' });
    
    const hash = await voteForOpinion(
      walletClient,
      publicClient,
      contractAddress,
      {
        proposalId: BigInt(id),
        opinionIndex: BigInt(opinionIndex)
      }
    );

    setStatus({ 
      type: 'success', 
      message: 'Vote submitted successfully!', 
      txHash: hash 
    });

    // Optimistic update of the UI
    // ... existing code ...
  } catch (error) {
    console.error('Error voting for opinion:', error);
    setStatus({ 
      type: 'error', 
      message: `Failed to vote: ${error instanceof Error ? error.message : String(error)}` 
    });
  }
}; 