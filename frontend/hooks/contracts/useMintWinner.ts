import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { useWallet } from '@/components/WalletProvider';
import React from 'react';

export const useMintWinner = () => {
  // Use global wallet state
  const { contract, userAddress, isConnected } = useWallet();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Loading states
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [winnerSubmissionId, setWinnerSubmissionId] = useState<number | null>(null);
  const [winnerAddress, setWinnerAddress] = useState<string>('');

  // Check if user is owner when contract is available
  const checkOwnerStatus = async () => {
    if (contract && userAddress) {
      try {
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === userAddress.toLowerCase());
      } catch (err) {
        console.error('Error checking owner status:', err);
        setIsOwner(false);
      }
    }
  };

  // Check owner status when contract or user address changes
  React.useEffect(() => {
    checkOwnerStatus();
  }, [contract, userAddress]);

  // Mint winner function
  const mintWinner = async (poolId: number) => {
    if (!contract || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      setError('Only the contract owner can mint the winner');
      return;
    }

    try {
      setIsMinting(true);
      setError('');
      setSuccess('');

      console.log('Minting winner for pool:', poolId);

      // Call smart contract
      const tx = await contract.mintWinner(poolId);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get winner details from event
      const winnerMintedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'WinnerMinted';
        } catch {
          return false;
        }
      });

      if (winnerMintedEvent) {
        const parsed = contract.interface.parseLog(winnerMintedEvent);
        const eventPoolId = Number(parsed?.args[0]);
        const eventSubmissionId = Number(parsed?.args[1]);
        const eventWinnerAddress = parsed?.args[2];
        const eventTokenId = Number(parsed?.args[3]);

        setWinnerSubmissionId(eventSubmissionId);
        setWinnerAddress(eventWinnerAddress);
        setMintedTokenId(eventTokenId);

        // Add NFT mint record to database
        try {
          await addNftMintToDatabase({
            poolId: eventPoolId,
            submissionId: eventSubmissionId,
            winnerAddress: eventWinnerAddress,
            tokenId: eventTokenId,
            txHash: tx.hash
          });
          setSuccess('Winner NFT minted successfully!');
        } catch (dbError) {
          console.error('Database insertion failed:', dbError);
          setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          return;
        }
      }
      
      // Reset transaction hash
      setTxHash('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint winner');
    } finally {
      setIsMinting(false);
    }
  };

  // Add NFT mint to database
  const addNftMintToDatabase = async (mintData: {
    poolId: number;
    submissionId: number;
    winnerAddress: string;
    tokenId: number;
    txHash: string;
  }) => {
    try {
      console.log('Adding NFT mint to database:', mintData);

      // First find the database submission ID that corresponds to the contract submission ID
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('id')
        .eq('pool_id', mintData.poolId)
        .eq('contract_submission_id', mintData.submissionId)
        .single();

      if (submissionError) {
        console.error('Error finding submission:', submissionError);
        throw new Error(`Failed to find submission: ${submissionError.message}`);
      }

      // Insert NFT mint record with current owner
      const { data, error } = await supabase
        .from('nft_mints')
        .insert({
          submission_id: submission.id, // Use database submission ID
          minted_token_id: mintData.tokenId.toString(),
          mint_tx_hash: mintData.txHash,
          current_owner_address: mintData.winnerAddress // Set initial owner
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to add NFT mint to database: ${error.message}`);
      }

      console.log('Successfully added NFT mint to database:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Check if pool is ready for winner minting
  const isPoolReadyForMinting = async (poolId: number) => {
    if (!contract) return false;

    try {
      const pool = await contract.pools(poolId);
      const now = Math.floor(Date.now() / 1000);
      
      // Pool must be past voting deadline and not already have winner minted
      return pool.votingDeadline < now && !pool.winnerMinted;
    } catch (err) {
      console.error('Error checking pool readiness:', err);
      return false;
    }
  };

  // Get pool details
  const getPoolDetails = async (poolId: number) => {
    if (!contract) return null;

    try {
      const pool = await contract.pools(poolId);
      return {
        id: poolId,
        poolType: pool.poolType,
        matchId: pool.matchId,
        submissionDeadline: Number(pool.submissionDeadline),
        votingDeadline: Number(pool.votingDeadline),
        active: pool.active,
        winnerMinted: pool.winnerMinted
      };
    } catch (err) {
      console.error('Error fetching pool details:', err);
      return null;
    }
  };

  return {
    // Contract state from global wallet
    userAddress,
    isConnected,
    isOwner,
    
    // Loading states
    isMinting,
    error,
    success,
    
    // Transaction states
    txHash,
    mintedTokenId,
    winnerSubmissionId,
    winnerAddress,
    
    // Functions
    mintWinner,
    isPoolReadyForMinting,
    getPoolDetails
  };
}; 