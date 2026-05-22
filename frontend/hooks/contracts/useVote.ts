import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

export interface VoteParams {
  poolId: number;
  submissionId: number;
  voterAddress: string;
}

export const useVote = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userPsgBalance, setUserPsgBalance] = useState<string>('');

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');

  // Initialize contract connection
  const initializeContract = async () => {
    try {
      setIsInitializing(true);
      setError('');
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(fanArtContractAddress, fanArtABI, signer);
      
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      
      // Get user address
      const address = await signer.getAddress();
      setUserAddress(address);
      
      // Get PSG token balance
      const psgToken = await contract.psgToken();
      const psgContract = new ethers.Contract(psgToken, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], signer);
      
      const balance = await psgContract.balanceOf(address);
      const decimals = await psgContract.decimals();
      setUserPsgBalance(ethers.formatUnits(balance, decimals));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
    } finally {
      setIsInitializing(false);
    }
  };

  // Vote function - takes poolId and contractSubmissionId
  const vote = async (poolId: number, contractSubmissionId: number) => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    // Check if user has enough PSG tokens (10 tokens required)
    const requiredTokens = 10;
    const userBalance = parseFloat(userPsgBalance);
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

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeContract();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  return {
    // Contract state
    contract,
    provider,
    signer,
    userAddress,
    userPsgBalance,
    
    // Loading states
    isInitializing,
    isVoting,
    error,
    success,
    
    // Transaction states
    txHash,
    
    // Functions
    initializeContract,
    vote,
    connectWallet
  };
}; 