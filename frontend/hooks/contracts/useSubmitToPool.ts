import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';
import { usePinataUpload } from '@/hooks/ipfs/usePinataUpload';

export interface SubmitToPoolParams {
  poolId: number;
  contentUrl: string; // IPFS CID
  creatorAddress: string;
}

export const useSubmitToPool = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userPsgBalance, setUserPsgBalance] = useState<string>('');

  // Form states
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [poolDetails, setPoolDetails] = useState<any>(null);

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [submissionId, setSubmissionId] = useState<number | null>(null);

  // IPFS Upload hook
  const {
    selectedFile,
    uploadedCID,
    isUploading,
    error: uploadError,
    uploadProgress,
    fileValidation,
    uploadToPinata,
    handleFileSelect,
    resetUpload,
    getGatewayUrl
  } = usePinataUpload();

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

  // Get pool details
  const getPoolDetails = async (poolId: number) => {
    try {
      const pool = await contract?.pools(poolId);
      if (pool) {
        setPoolDetails({
          id: poolId,
          poolType: pool.poolType,
          matchId: pool.matchId,
          submissionDeadline: Number(pool.submissionDeadline),
          votingDeadline: Number(pool.votingDeadline),
          active: pool.active
        });
      }
    } catch (err) {
      console.error('Error fetching pool details:', err);
    }
  };

  // Submit to pool function
  const submitToPool = async () => {
    if (!contract || !selectedPoolId || !uploadedCID) {
      setError('Please select a pool and upload content first');
      return;
    }



    // Check if user has enough PSG tokens (10 tokens required)
    const requiredTokens = 10;
    const userBalance = parseFloat(userPsgBalance);
    if (userBalance < requiredTokens) {
      setError(`You need at least ${requiredTokens} PSG tokens to submit. Current balance: ${userBalance}`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      // Create content URL with metadata
      const contentUrl = `ipfs://${uploadedCID}`;

      // Call smart contract
      const tx = await contract.submitToPool(selectedPoolId, contentUrl);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get submission ID from event
      const submissionMadeEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'SubmissionMade';
        } catch {
          return false;
        }
      });

      let newSubmissionId = null;
      if (submissionMadeEvent) {
        const parsed = contract.interface.parseLog(submissionMadeEvent);
        newSubmissionId = Number(parsed?.args[1]); // submissionId is the second argument
        setSubmissionId(newSubmissionId);
      }

      // Add to database with the submission ID from the contract
      try {
        await addSubmissionToDatabase({
          poolId: selectedPoolId,
          contentUrl: uploadedCID,
          creatorAddress: userAddress,
          submissionId: newSubmissionId
        });
        setSuccess('Submission created successfully!');
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        return;
      }
      
      // Reset form
      resetForm();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit to pool');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add submission to database
  const addSubmissionToDatabase = async (submissionData: {
    poolId: number;
    contentUrl: string;
    creatorAddress: string;
    submissionId: number | null;
  }) => {
    try {
      console.log('Attempting to insert submission into database:', submissionData);

      const { data, error } = await supabase
        .from('submissions')
        .insert({
          pool_id: submissionData.poolId,
          creator_address: submissionData.creatorAddress,
          content_url: submissionData.contentUrl,
          vote_count: 0,
          contract_submission_id: submissionData.submissionId // Store contract ID separately
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
        throw new Error(`Failed to add submission to database: ${error.message}`);
      }

      console.log('Successfully inserted submission into database:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedPoolId(null);
    setPoolDetails(null);
    setTxHash('');
    setSubmissionId(null);
    resetUpload();
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

  // Handle pool selection
  const handlePoolSelect = async (poolId: number) => {
    setSelectedPoolId(poolId);
    await getPoolDetails(poolId);
  };

  // Format timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get pool status
  const getPoolStatus = (pool: any) => {
    if (!pool) return 'Unknown';
    
    const now = Math.floor(Date.now() / 1000);
    
    if (!pool.active) return 'Inactive';
    if (pool.submissionDeadline > now) return 'Upcoming';
    if (pool.votingDeadline > now) return 'Active';
    return 'Expired';
  };

  return {
    // Contract state
    contract,
    provider,
    signer,
    userAddress,
    userPsgBalance,
    
    // Form states
    selectedPoolId,
    setSelectedPoolId,
    poolDetails,
    
    // Loading states
    isInitializing,
    isSubmitting,
    error,
    success,
    
    // Transaction states
    txHash,
    submissionId,
    
    // IPFS states (from usePinataUpload)
    selectedFile,
    uploadedCID,
    isUploading,
    uploadError,
    uploadProgress,
    fileValidation,
    
    // Functions
    initializeContract,
    submitToPool,
    resetForm,
    connectWallet,
    handlePoolSelect,
    formatDate,
    getPoolStatus,
    
    // IPFS functions (from usePinataUpload)
    uploadToPinata,
    handleFileSelect,
    resetUpload,
    getGatewayUrl
  };
}; 