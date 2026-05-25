import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { fanArtContractAddress, abi as fanArtABI } from '@/lib/fanArtContract';

// Hardcoded PSG token address
const PSG_TOKEN_ADDRESS = '0xC1771089870D3dDF8174775ed12D09Ff8DeCc550';

export const usePsgBalance = () => {
  // State
  const [userAddress, setUserAddress] = useState<string>('');
  const [psgBalance, setPsgBalance] = useState<string>('0');
  const [psgTokenAddress, setPsgTokenAddress] = useState<string>(PSG_TOKEN_ADDRESS);
  
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
      
      // Use hardcoded PSG token address
      setPsgTokenAddress(PSG_TOKEN_ADDRESS);
      
      // Fetch PSG balance
      await fetchPsgBalance(PSG_TOKEN_ADDRESS, address, provider);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch PSG token balance
  const fetchPsgBalance = async (tokenAddress: string, address: string, providerToUse?: ethers.BrowserProvider) => {
    try {
      console.log('Fetching PSG balance for address:', address);
      console.log('PSG token address:', tokenAddress);
      
      // Use passed provider or fall back to state provider
      const contractProvider = providerToUse || provider;
      console.log('Provider available:', !!contractProvider);
      console.log('Signer available:', !!signer);
      
      // Use provider for read-only calls, it's more reliable
      if (!contractProvider) {
        console.log('No provider available for PSG balance fetch');
        return;
      }

      // Create a simple ERC20 contract interface
      const psgContract = new ethers.Contract(tokenAddress, [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)"
      ], contractProvider);

      console.log('PSG contract created, calling balanceOf...');
      
      // Try to get balance first, then other details
      try {
        const balance = await psgContract.balanceOf(address);
        console.log('Raw balance:', balance.toString());
        
        // Set a default balance even if we can't get decimals/symbol
        const formattedBalance = ethers.formatUnits(balance, 18); // Assume 18 decimals
        setPsgBalance(formattedBalance);
        console.log(`PSG Balance: ${formattedBalance} PSG`);
        
        // Try to get decimals and symbol separately
        try {
          const decimals = await psgContract.decimals();
          const symbol = await psgContract.symbol();
          console.log('Decimals:', decimals);
          console.log('Symbol:', symbol);
          
          // Update with correct decimals if different from 18
          if (decimals !== 18) {
            const correctBalance = ethers.formatUnits(balance, decimals);
            setPsgBalance(correctBalance);
            console.log(`Corrected PSG Balance: ${correctBalance} ${symbol}`);
          }
        } catch (detailsError) {
          console.log('Could not fetch token details, using defaults');
        }
        
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
        setPsgBalance('0');
        setError('Failed to fetch PSG balance');
      }
      
    } catch (err) {
      console.error('Error fetching PSG balance:', err);
      setError('Failed to fetch PSG balance');
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (psgTokenAddress && userAddress && provider) {
      await fetchPsgBalance(psgTokenAddress, userAddress, provider);
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
    setPsgTokenAddress(PSG_TOKEN_ADDRESS);
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

  // Auto-connect if wallet is already connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            console.log('Auto-connecting to existing wallet:', accounts[0]);
            await initializeContract();
          }
        } catch (err) {
          console.log('Auto-connect failed:', err);
        }
      }
    };

    autoConnect();
  }, []);

  // Auto-refresh balance when account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (isConnected && accounts[0] !== userAddress) {
          setUserAddress(accounts[0]);
          if (psgTokenAddress && provider) {
            await fetchPsgBalance(psgTokenAddress, accounts[0], provider);
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