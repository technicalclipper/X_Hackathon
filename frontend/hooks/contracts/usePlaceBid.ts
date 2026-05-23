import { useState } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

export const usePlaceBid = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  // Form states
  const [tokenId, setTokenId] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isBidding, setIsBidding] = useState<boolean>(false);
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

  // Place bid function
  const placeBid = async () => {
    if (!contract) {
      setError('Contract not initialized');
      return;
    }

    if (!tokenId || !bidAmount) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsBidding(true);
      setError('');
      setSuccess('');

      const tokenIdNum = parseInt(tokenId);
      const bidAmountWei = ethers.parseEther(bidAmount);

      console.log('Placing bid for token:', tokenIdNum);
      console.log('Bid amount (ETH):', bidAmount);
      console.log('Bid amount (wei):', bidAmountWei.toString());

      // Call smart contract with ETH value
      const tx = await contract.placeBid(tokenIdNum, { value: bidAmountWei });
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Get bid details from event
      const bidPlacedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'BidPlaced';
        } catch {
          return false;
        }
      });

      if (bidPlacedEvent) {
        const parsed = contract.interface.parseLog(bidPlacedEvent);
        const eventTokenId = Number(parsed?.args[0]);
        const eventBidder = parsed?.args[1];
        const eventAmount = Number(parsed?.args[2]);

        // Add bid record to database
        try {
          await addBidToDatabase({
            tokenId: eventTokenId,
            bidderAddress: eventBidder,
            amount: eventAmount.toString(),
            txHash: tx.hash
          });

          // Update auction's highest bid in database
          await updateAuctionHighestBid({
            tokenId: eventTokenId,
            highestBid: eventAmount.toString(),
            highestBidderAddress: eventBidder
          });

          setSuccess('Bid placed successfully!');
        } catch (dbError) {
          console.error('Database insertion failed:', dbError);
          setError(`Contract transaction successful, but database insertion failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
          return;
        }
      }
      
      // Reset form
      setTokenId('');
      setBidAmount('');
      setTxHash('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bid');
    } finally {
      setIsBidding(false);
    }
  };

  // Add bid to database
  const addBidToDatabase = async (bidData: {
    tokenId: number;
    bidderAddress: string;
    amount: string;
    txHash: string;
  }) => {
    try {
      console.log('Adding bid to database:', bidData);

      // Insert bid record
      const { data, error } = await supabase
        .from('bids')
        .insert({
          token_id: bidData.tokenId,
          bidder_address: bidData.bidderAddress,
          amount: bidData.amount
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to add bid to database: ${error.message}`);
      }

      console.log('Successfully added bid to database:', data);
      return data;
    } catch (err) {
      console.error('Database error:', err);
      throw err;
    }
  };

  // Update auction's highest bid
  const updateAuctionHighestBid = async (auctionData: {
    tokenId: number;
    highestBid: string;
    highestBidderAddress: string;
  }) => {
    try {
      console.log('Updating auction highest bid:', auctionData);

      const { data, error } = await supabase
        .from('auctions')
        .update({
          highest_bid: auctionData.highestBid,
          highest_bidder_address: auctionData.highestBidderAddress
        })
        .eq('token_id', auctionData.tokenId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to update auction: ${error.message}`);
      }

      console.log('Successfully updated auction:', data);
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
    setBidAmount('');
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
    bidAmount,
    setBidAmount,
    
    // Loading states
    isInitializing,
    isBidding,
    error,
    success,
    
    // Transaction states
    txHash,
    
    // Functions
    initializeContract,
    placeBid,
    connectWallet,
    resetForm
  };
}; 