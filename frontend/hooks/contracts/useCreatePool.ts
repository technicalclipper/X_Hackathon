import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

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
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Form states
  const [poolType, setPoolType] = useState<PoolType>(PoolType.TIFO);
  const [matchId, setMatchId] = useState<string>('');
  const [submissionDeadline, setSubmissionDeadline] = useState<string>('');
  const [votingDeadline, setVotingDeadline] = useState<string>('');

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [poolId, setPoolId] = useState<number | null>(null);

  // Initialize contract connection
  const initializeContract = async () => {
    try {
      setIsInitializing(true);
      setError('');
      
      // Test Supabase connection first
      console.log('Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('pools')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase connection test failed:', testError);
        setError(`Supabase connection failed: ${testError.message}`);
        return;
      }
      
      console.log('Supabase connection successful');
      
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
      
      // Check if user is owner
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
    } finally {
      setIsInitializing(false);
    }
  };

  // Create pool function
  const createPool = async () => {
    if (!contract || !isOwner) {
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
    // Contract state
    contract,
    provider,
    signer,
    userAddress,
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
    isInitializing,
    isCreating,
    error,
    success,
    
    // Transaction states
    txHash,
    poolId,
    
    // Functions
    initializeContract,
    createPool,
    resetForm,
    connectWallet,
    getPoolTypeLabel,
    
    // Constants
    PoolType
  };
}; 