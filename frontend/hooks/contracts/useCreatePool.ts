import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { useWallet } from '@/components/WalletProvider';
import React from 'react'; // Added missing import for React

export enum PoolType {
  TIFO = 0,
  MATCH_VIDEO = 1,
  JERSEY = 2,
  TICKETS = 3
}

export interface CreatePoolParams {
  poolType: PoolType;
  matchId: string;
  submissionDeadline: number; // Unix timestamp
  votingDeadline: number; // Unix timestamp
}

export const useCreatePool = () => {
  // Use global wallet state
  const { contract, userAddress, isConnected } = useWallet();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Form states
  const [poolType, setPoolType] = useState<PoolType>(PoolType.TIFO);
  const [matchId, setMatchId] = useState<string>('');
  const [submissionDeadline, setSubmissionDeadline] = useState<string>('');
  const [votingDeadline, setVotingDeadline] = useState<string>('');

  // Loading states
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [poolId, setPoolId] = useState<number | null>(null);

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

  // Create pool function
  const createPool = async () => {
    if (!contract || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isOwner) {
      setError('You must be the contract owner to create pools');
      return;
    }

    // Validate inputs
    if (!matchId.trim()) {
      setError('Match ID is required');
      return;
    }

    const submissionTimestamp = Math.floor(new Date(submissionDeadline).getTime() / 1000);
    const votingTimestamp = Math.floor(new Date(votingDeadline).getTime() / 1000);
    
    if (submissionTimestamp >= votingTimestamp) {
      setError('Submission deadline must be before voting deadline');
      return;
    }

    if (submissionTimestamp <= Math.floor(Date.now() / 1000)) {
      setError('Submission deadline must be in the future');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setSuccess('');

      // Call smart contract
      const tx = await contract.createPool(
        poolType,
        matchId,
        submissionTimestamp,
        votingTimestamp
      );

      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get current pool count from contract (this will be the new pool ID)
      const currentPoolCount = await contract.poolCount();
      const newPoolId = Number(currentPoolCount);
      setPoolId(newPoolId);

      // Add to database with the contract pool ID
      try {
        await addPoolToDatabase({
          poolType,
          matchId,
          submissionDeadline: submissionTimestamp,
          votingDeadline: votingTimestamp
        }, newPoolId);
        setSuccess('Pool created successfully!');
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        return; // Don't reset form if database failed
      }
      
      // Reset form only if both contract and database succeeded
      resetForm();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pool');
    } finally {
      setIsCreating(false);
    }
  };

  // Add pool to database
  const addPoolToDatabase = async (poolData: CreatePoolParams, poolId: number) => {
    try {
      console.log('Attempting to insert pool into database:', {
        id: poolId,
        pool_type: PoolType[poolData.poolType],
        match_id: poolData.matchId,
        submission_deadline: poolData.submissionDeadline,
        voting_deadline: poolData.votingDeadline,
        active: true
      });

      const { data, error } = await supabase
        .from('pools')
        .insert({
          id: poolId,
          pool_type: PoolType[poolData.poolType],
          match_id: poolData.matchId,
          submission_deadline: poolData.submissionDeadline,
          voting_deadline: poolData.votingDeadline,
          active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to add pool to database: ${error.message}`);
      }

      console.log('Successfully inserted pool into database:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      // Re-throw the error so we can see it in the UI
      throw err;
    }
  };

  // Reset form
  const resetForm = () => {
    setPoolType(PoolType.TIFO);
    setMatchId('');
    setSubmissionDeadline('');
    setVotingDeadline('');
    setTxHash('');
    setPoolId(null);
  };

  // Get pool type label
  const getPoolTypeLabel = (type: PoolType): string => {
    switch (type) {
      case PoolType.TIFO: return 'TIFO';
      case PoolType.MATCH_VIDEO: return 'Match Video';
      case PoolType.JERSEY: return 'Jersey';
      case PoolType.TICKETS: return 'Tickets';
      default: return 'Unknown';
    }
  };

  return {
    // Contract state from global wallet
    userAddress,
    isConnected,
    isOwner,
    
    // Form states
    poolType,
    setPoolType,
    matchId,
    setMatchId,
    submissionDeadline,
    setSubmissionDeadline,
    votingDeadline,
    setVotingDeadline,
    
    // Loading states
    isCreating,
    error,
    success,
    
    // Transaction states
    txHash,
    poolId,
    
    // Functions
    createPool,
    resetForm,
    getPoolTypeLabel,
    
    // Constants
    PoolType
  };
}; 