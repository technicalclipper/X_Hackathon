import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { useWallet } from '@/components/WalletProvider';

export interface VoteParams {
  poolId: number;
  submissionId: number;
  voterAddress: string;
}

export const useVote = () => {
  // Use global wallet state
  const { contract, userAddress, isConnected, psgBalance } = useWallet();

  // Loading states
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');

  // Vote function - takes poolId and contractSubmissionId
  const vote = async (poolId: number, contractSubmissionId: number) => {
    if (!contract || !isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    // Check if user has enough PSG tokens (10 tokens required)
    const requiredTokens = 10;
    const userBalance = parseFloat(psgBalance);
    if (userBalance < requiredTokens) {
      setError(`You need at least ${requiredTokens} PSG tokens to vote. Current balance: ${userBalance}`);
      return;
    }

    try {
      setIsVoting(true);
      setError('');
      setSuccess('');

      console.log('Voting on contract:', { poolId, contractSubmissionId });

      // Call smart contract with poolId and contractSubmissionId
      const tx = await contract.vote(poolId, contractSubmissionId);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Find the database submission ID that corresponds to this contract submission ID
      const databaseSubmissionId = await findDatabaseSubmissionId(poolId, contractSubmissionId);
      
      if (!databaseSubmissionId) {
        throw new Error('Could not find corresponding database submission');
      }

      // Add vote to database and increment submission vote count
      try {
        await addVoteToDatabase({
          poolId,
          submissionId: databaseSubmissionId, // Use database submission ID for votes table (foreign key constraint)
          voterAddress: userAddress
        });
        await incrementSubmissionVoteCount(databaseSubmissionId); // Use database submission ID for updating vote count
        setSuccess('Vote submitted successfully!');
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        return;
      }
      
      // Reset transaction hash
      setTxHash('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Add vote to database
  const addVoteToDatabase = async (voteData: {
    poolId: number;
    submissionId: number;
    voterAddress: string;
  }) => {
    try {
      console.log('Attempting to insert vote into database:', voteData);

      const { data, error } = await supabase
        .from('votes')
        .insert({
          pool_id: voteData.poolId,
          submission_id: voteData.submissionId, // This is the contract submission ID
          voter_address: voteData.voterAddress
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
        throw new Error(`Failed to add vote to database: ${error.message}`);
      }

      console.log('Successfully inserted vote into database:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Find database submission ID by pool ID and contract submission ID
  const findDatabaseSubmissionId = async (poolId: number, contractSubmissionId: number) => {
    try {
      console.log('Finding database submission ID:', { poolId, contractSubmissionId });

      const { data, error } = await supabase
        .from('submissions')
        .select('id')
        .eq('pool_id', poolId)
        .eq('contract_submission_id', contractSubmissionId)
        .single();

      if (error) {
        console.error('Supabase error finding submission:', error);
        throw new Error(`Failed to find database submission: ${error.message}`);
      }

      console.log('Found database submission ID:', data?.id);
      return data?.id;
    } catch (err) {
      console.error('Database error:', err);
      return null;
    }
  };

  // Increment submission vote count
  const incrementSubmissionVoteCount = async (submissionId: number) => {
    try {
      console.log('Incrementing vote count for submission:', submissionId);

      // First get current vote count
      const { data: currentSubmission, error: fetchError } = await supabase
        .from('submissions')
        .select('vote_count')
        .eq('id', submissionId)
        .single();

      if (fetchError) {
        console.error('Supabase error fetching submission:', fetchError);
        throw new Error(`Failed to fetch submission vote count: ${fetchError.message}`);
      }

      // Increment vote count
      const { data, error } = await supabase
        .from('submissions')
        .update({ vote_count: (currentSubmission.vote_count || 0) + 1 })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating vote count:', error);
        throw new Error(`Failed to increment submission vote count: ${error.message}`);
      }

      console.log('Successfully incremented submission vote count:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  return {
    // Contract state from global wallet
    userAddress,
    isConnected,
    userPsgBalance: psgBalance,
    
    // Loading states
    isVoting,
    error,
    success,
    
    // Transaction states
    txHash,
    
    // Functions
    vote
  };
}; 