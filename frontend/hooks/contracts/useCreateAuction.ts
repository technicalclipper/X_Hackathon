import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { useWallet } from '@/components/WalletProvider';

export const useCreateAuction = () => {
  // Use global wallet state
  const { contract, userAddress, isConnected } = useWallet();

  // Form states
  const [tokenId, setTokenId] = useState<string>('');
  const [minBid, setMinBid] = useState<string>('');
  const [requiredPsgTokens, setRequiredPsgTokens] = useState<string>('');

  // Loading states
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');

  // Create auction function
  const createAuction = async () => {
    if (!contract || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenId || !minBid || !requiredPsgTokens) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setSuccess('');

      const tokenIdNum = parseInt(tokenId);
      const minBidWei = ethers.parseEther(minBid);
      const requiredPsgTokensWei = ethers.parseEther(requiredPsgTokens);

      console.log('Creating auction for token:', tokenIdNum);
      console.log('Min bid (ETH):', minBid);
      console.log('Required PSG tokens:', requiredPsgTokens);

      // Verify that the user owns this NFT
      try {
        const currentOwner = await contract.ownerOf(tokenIdNum);
        if (currentOwner.toLowerCase() !== userAddress.toLowerCase()) {
          setError('You do not own this NFT. Only the current owner can create an auction.');
          return;
        }
        console.log('NFT ownership verified. Current owner:', currentOwner);
      } catch (err) {
        setError('Failed to verify NFT ownership. Please check the token ID.');
        return;
      }

      // Call smart contract
      const tx = await contract.createAuction(tokenIdNum, minBidWei, requiredPsgTokensWei);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get auction details from event
      const auctionCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'AuctionCreated';
        } catch {
          return false;
        }
      });

      if (auctionCreatedEvent) {
        const parsed = contract.interface.parseLog(auctionCreatedEvent);
        const eventTokenId = Number(parsed?.args[0]);
        const eventSeller = parsed?.args[1];
        const eventMinBid = Number(parsed?.args[2]);
        const eventRequiredPsgTokens = Number(parsed?.args[3]);

        // Add auction record to database
        try {
          await addAuctionToDatabase({
            tokenId: eventTokenId,
            sellerAddress: eventSeller,
            minBid: eventMinBid.toString(),
            requiredPsgTokens: eventRequiredPsgTokens.toString(),
            txHash: tx.hash
          });
          setSuccess('Auction created successfully!');
        } catch (dbError) {
          console.error('Database insertion failed:', dbError);
          setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          return;
        }
      }
      
      // Reset form
      setTokenId('');
      setMinBid('');
      setRequiredPsgTokens('');
      setTxHash('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction');
    } finally {
      setIsCreating(false);
    }
  };

  // Add auction to database
  const addAuctionToDatabase = async (auctionData: {
    tokenId: number;
    sellerAddress: string;
    minBid: string;
    requiredPsgTokens: string;
    txHash: string;
  }) => {
    try {
      console.log('Adding auction to database:', auctionData);

      // Check if there's already an auction for this token
      const { data: existingAuction, error: checkError } = await supabase
        .from('auctions')
        .select('*')
        .eq('token_id', auctionData.tokenId)
        .single();

      let result;
      if (existingAuction) {
        // Update existing auction
        console.log('Updating existing auction for token:', auctionData.tokenId);
        const { data, error } = await supabase
          .from('auctions')
          .update({
            seller_address: auctionData.sellerAddress,
            min_bid: auctionData.minBid,
            required_psg_tokens: auctionData.requiredPsgTokens,
            highest_bid: null,
            highest_bidder_address: null,
            active: true
          })
          .eq('token_id', auctionData.tokenId)
          .select()
          .single();

        if (error) {
          console.error('Supabase error updating auction:', error);
          throw new Error(`Failed to update auction in database: ${error.message}`);
        }
        result = data;
      } else {
        // Create new auction record
        console.log('Creating new auction record for token:', auctionData.tokenId);
        const { data, error } = await supabase
          .from('auctions')
          .insert({
            token_id: auctionData.tokenId,
            seller_address: auctionData.sellerAddress,
            min_bid: auctionData.minBid,
            required_psg_tokens: auctionData.requiredPsgTokens,
            active: true
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error creating auction:', error);
          throw new Error(`Failed to add auction to database: ${error.message}`);
        }
        result = data;
      }

      console.log('Successfully processed auction in database:', result);
      return result;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Reset form
  const resetForm = () => {
    setTokenId('');
    setMinBid('');
    setRequiredPsgTokens('');
    setError('');
    setSuccess('');
    setTxHash('');
  };

  return {
    // Contract state from global wallet
    userAddress,
    isConnected,
    
    // Form states
    tokenId,
    setTokenId,
    minBid,
    setMinBid,
    requiredPsgTokens,
    setRequiredPsgTokens,
    
    // Loading states
    isCreating,
    error,
    success,
    
    // Transaction states
    txHash,
    
    // Functions
    createAuction,
    resetForm
  };
}; 