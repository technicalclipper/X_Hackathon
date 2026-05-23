import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

export const useMintWinner = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [winnerSubmissionId, setWinnerSubmissionId] = useState<number | null>(null);
  const [winnerAddress, setWinnerAddress] = useState<string>('');

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
      
      // Check if user is contract owner
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
    } finally {
      setIsInitializing(false);
    }
  };

  // Mint winner function
  const mintWinner = async (poolId: number) => {
    if (!contract) {
      setError('Contract not initialized');
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

      // Insert NFT mint record
      const { data, error } = await supabase
        .from('nft_mints')
        .insert({
          submission_id: submission.id, // Use database submission ID
          minted_token_id: mintData.tokenId.toString(),
          mint_tx_hash: mintData.txHash
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
    isOwner,
    
    // Loading states
    isInitializing,
    isMinting,
    error,
    success,
    
    // Transaction states
    txHash,
    mintedTokenId,
    winnerSubmissionId,
    winnerAddress,
    
    // Functions
    initializeContract,
    mintWinner,
    connectWallet,
    isPoolReadyForMinting,
    getPoolDetails
  };
}; 