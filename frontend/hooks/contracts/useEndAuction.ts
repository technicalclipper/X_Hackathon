import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';
import supabase from '@/lib/supabaseConfig';

export const useEndAuction = () => {
  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  // Form states
  const [tokenId, setTokenId] = useState<string>('');

  // Loading states
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Transaction states
  const [txHash, setTxHash] = useState<string>('');
  const [winnerAddress, setWinnerAddress] = useState<string>('');
  const [finalAmount, setFinalAmount] = useState<string>('');

  // Auto-connect wallet on mount
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await initializeContract();
          }
        } catch (err) {
          console.log('Auto-connect failed:', err);
        }
      }
    };

    autoConnect();
  }, []);

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

  // End auction function
  const endAuction = async () => {
    if (!contract) {
      setError('Contract not initialized');
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

        // Update auction status in database
        try {
          await updateAuctionStatus({
            tokenId: eventTokenId,
            active: false,
            txHash: tx.hash
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
    setError('');
    setSuccess('');
    setTxHash('');
    setWinnerAddress('');
    setFinalAmount('');
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
    
    // Loading states
    isInitializing,
    isEnding,
    error,
    success,
    
    // Transaction states
    txHash,
    winnerAddress,
    finalAmount,
    
    // Functions
    initializeContract,
    endAuction,
    connectWallet,
    resetForm
  };
}; 