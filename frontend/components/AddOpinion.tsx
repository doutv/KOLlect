const handleAddOpinion = async () => {
  if (!opinion) return;
  if (!walletClient || !address || !contractAddress) {
    setStatus({ type: 'error', message: 'Wallet not connected' });
    return;
  }

  try {
    setStatus({ type: 'pending', message: 'Submitting opinion...' });
    
    const hash = await createOpinion(
      walletClient,
      publicClient,
      contractAddress,
      {
        proposalId: BigInt(proposalId),
        vote: opinion.stance === "for",
        reasoning: opinion.reasoning
      }
    );

    // ... existing code ...
  } catch (error) {
    // ... existing code ...
  }
}; 