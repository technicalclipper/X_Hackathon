import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

export const useCreateAuction = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  // Form states
  const [tokenId, setTokenId] = useState<string>('');
  const [minBid, setMinBid] = useState<string>('');
  const [requiredPsgTokens, setRequiredPsgTokens] = useState<string>('');

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
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
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
    } finally {
      setIsInitializing(false);
    }
  };

  // Create auction function
  const createAuction = async () => {
    if (!contract) {
      setError('Contract not initialized');
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

      // Insert auction record
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
        console.error('Supabase error:', error);
        throw new Error(`Failed to add auction to database: ${error.message}`);
      }

      console.log('Successfully added auction to database:', data);
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
    // Contract state
    contract,
    provider,
    signer,
    userAddress,
    
    // Form states
    tokenId,
    setTokenId,
    minBid,
    setMinBid,
    requiredPsgTokens,
    setRequiredPsgTokens,
    
    // Loading states
    isInitializing,
    isCreating,
    error,
    success,
    
    // Transaction states
    txHash,
    
    // Functions
    initializeContract,
    createAuction,
    connectWallet,
    resetForm
  };
}; 