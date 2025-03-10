const onSubmit = async (data: FormData) => {
  if (!walletClient || !address || !contractAddress) {
    setStatus({ type: 'error', message: 'Wallet not connected' });
    return;
  }

  try {
    setStatus({ type: 'pending', message: 'Creating proposal...' });
    
    // Convert days to seconds for the contract
    const durationInSeconds = BigInt(parseInt(data.duration) * 24 * 60 * 60);
    
    const hash = await createProposal(
      walletClient,
      publicClient, // Pass the publicClient for gas estimation
      contractAddress,
      {
        title: data.title,
        details: data.description,
        duration: durationInSeconds
      }
    );

    setStatus({ 
      type: 'success', 
      message: 'Proposal created successfully!', 
      txHash: hash 
    });
    
    // Reset form and close dialog
    form.reset();
    onClose();
    
    // Add optimistic update if needed
  } catch (error) {
    console.error('Error creating proposal:', error);
    setStatus({ 
      type: 'error', 
      message: `Failed to create proposal: ${error instanceof Error ? error.message : String(error)}` 
    });
  }
}; 