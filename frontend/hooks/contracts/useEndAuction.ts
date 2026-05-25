import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { useWallet } from '@/components/WalletProvider';

export const useEndAuction = () => {
  // Use global wallet state
  const { contract, userAddress, isConnected } = useWallet();

  // Form states
  const [tokenId, setTokenId] = useState<string>('');

  // Loading states
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [winnerAddress, setWinnerAddress] = useState<string>('');
  const [finalAmount, setFinalAmount] = useState<string>('');

  // End auction function
  const endAuction = async () => {
    if (!contract || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!tokenId) {
      setError('Token ID is required');
      return;
    }

    try {
      setIsEnding(true);
      setError('');
      setSuccess('');

      const tokenIdNum = parseInt(tokenId);

      console.log('Ending auction for token:', tokenIdNum);

      // Call smart contract
      const tx = await contract.endAuction(tokenIdNum);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get auction end details from event
      const auctionEndedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'AuctionEnded';
        } catch {
          return false;
        }
      });

      if (auctionEndedEvent) {
        const parsed = contract.interface.parseLog(auctionEndedEvent);
        const eventTokenId = Number(parsed?.args[0]);
        const eventWinner = parsed?.args[1];
        const eventAmount = Number(parsed?.args[2]);

        setWinnerAddress(eventWinner);
        setFinalAmount(eventAmount.toString());

        // Update auction status and NFT ownership in database
        try {
          await updateAuctionStatus({
            tokenId: eventTokenId,
            active: false,
            txHash: tx.hash
          });
          
          // Update NFT ownership to new owner
          await updateNftOwnership({
            tokenId: eventTokenId,
            newOwner: eventWinner
          });
          
          setSuccess('Auction ended successfully!');
        } catch (dbError) {
          console.error('Database update failed:', dbError);
          setError(`Contract transaction successful, but database update failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          return;
        }
      } else {
        // No bids were placed, just end the auction
        await updateAuctionStatus({
          tokenId: tokenIdNum,
          active: false,
          txHash: tx.hash
        });
        setSuccess('Auction ended successfully! (No bids were placed)');
      }
      
      // Reset form
      setTokenId('');
      setTxHash('');
      setWinnerAddress('');
      setFinalAmount('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end auction');
    } finally {
      setIsEnding(false);
    }
  };

  // Update auction status in database
  const updateAuctionStatus = async (auctionData: {
    tokenId: number;
    active: boolean;
    txHash: string;
  }) => {
    try {
      console.log('Updating auction status in database:', auctionData);

      const { data, error } = await supabase
        .from('auctions')
        .update({
          active: auctionData.active
        })
        .eq('token_id', auctionData.tokenId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to update auction status: ${error.message}`);
      }

      console.log('Successfully updated auction status:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Update NFT ownership in database
  const updateNftOwnership = async (ownershipData: {
    tokenId: number;
    newOwner: string;
  }) => {
    try {
      console.log('Updating NFT ownership in database:', ownershipData);

      const { data, error } = await supabase
        .from('nft_mints')
        .update({
          current_owner_address: ownershipData.newOwner
        })
        .eq('minted_token_id', ownershipData.tokenId.toString())
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to update NFT ownership: ${error.message}`);
      }

      console.log('Successfully updated NFT ownership:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Reset form
  const resetForm = () => {
    setTokenId('');
    setError('');
    setSuccess('');
    setTxHash('');
    setWinnerAddress('');
    setFinalAmount('');
  };

  return {
    // Contract state from global wallet
    userAddress,
    isConnected,
    
    // Form states
    tokenId,
    setTokenId,
    
    // Loading states
    isEnding,
    error,
    success,
    
    // Transaction states
    txHash,
    winnerAddress,
    finalAmount,
    
    // Functions
    endAuction,
    resetForm
  };
}; 