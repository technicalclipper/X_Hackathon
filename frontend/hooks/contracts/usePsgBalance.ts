import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';

export const usePsgBalance = () => {
  // State
  const [userAddress, setUserAddress] = useState<string>('');
  const [psgBalance, setPsgBalance] = useState<string>('0');
  const [psgTokenAddress, setPsgTokenAddress] = useState<string>('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Contract state
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  // Initialize contract connection
  const initializeContract = async () => {
    try {
      setIsLoading(true);
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
      setIsConnected(true);
      
      // Get PSG token address from contract
      const psgToken = await contract.psgToken();
      setPsgTokenAddress(psgToken);
      
      // Fetch PSG balance
      await fetchPsgBalance(psgToken, address);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch PSG token balance
  const fetchPsgBalance = async (tokenAddress: string, address: string) => {
    try {
      const psgContract = new ethers.Contract(tokenAddress, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ], signer || provider);

      const [balance, decimals, symbol] = await Promise.all([
        psgContract.balanceOf(address),
        psgContract.decimals(),
        psgContract.symbol()
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      setPsgBalance(formattedBalance);
      
      console.log(`PSG Balance: ${formattedBalance} ${symbol}`);
      
    } catch (err) {
      console.error('Error fetching PSG balance:', err);
      setError('Failed to fetch PSG balance');
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (psgTokenAddress && userAddress) {
      await fetchPsgBalance(psgTokenAddress, userAddress);
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

  // Disconnect wallet
  const disconnectWallet = () => {
    setUserAddress('');
    setPsgBalance('0');
    setPsgTokenAddress('');
    setIsConnected(false);
    setContract(null);
    setProvider(null);
    setSigner(null);
    setError('');
  };

  // Format balance for display
  const formatBalance = (balance: string, decimals: number = 2) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  };

  // Check if user has enough tokens
  const hasEnoughTokens = (requiredAmount: number) => {
    const currentBalance = parseFloat(psgBalance);
    return currentBalance >= requiredAmount;
  };

  // Get token requirements for different actions
  const getTokenRequirements = () => {
    return {
      submit: 10,
      vote: 10,
      bid: 'variable' // Depends on auction
    };
  };

  // Auto-refresh balance when account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (isConnected && accounts[0] !== userAddress) {
          setUserAddress(accounts[0]);
          if (psgTokenAddress) {
            await fetchPsgBalance(psgTokenAddress, accounts[0]);
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected, userAddress, psgTokenAddress]);

  return {
    // Data
    userAddress,
    psgBalance,
    psgTokenAddress,
    
    // Loading states
    isLoading,
    isConnected,
    error,
    
    // Contract state
    contract,
    provider,
    signer,
    
    // Functions
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatBalance,
    hasEnoughTokens,
    getTokenRequirements
  };
}; 