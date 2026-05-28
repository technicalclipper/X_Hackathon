import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { fanArtContractAddress, abi as fanArtABI } from "@/lib/fanArtContract";
import {
  FAN_TOKEN_ADDRESSES,
  FAN_TOKEN_ORDER,
  X_LAYER_TESTNET,
  type FanTokenSymbol,
} from "@/lib/xlayerConfig";

export const usePsgBalance = () => {
  const [userAddress, setUserAddress] = useState<string>("");
  const [fanBalances, setFanBalances] = useState<Record<FanTokenSymbol, string>>({
    ARG: "0",
    BRA: "0",
    FRA: "0",
  });
  const [okbBalance, setOkbBalance] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const ensureXLayerNetwork = async () => {
    if (typeof window.ethereum === "undefined") return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: X_LAYER_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: X_LAYER_TESTNET.chainIdHex,
              chainName: X_LAYER_TESTNET.chainName,
              nativeCurrency: X_LAYER_TESTNET.nativeCurrency,
              rpcUrls: [...X_LAYER_TESTNET.rpcUrls],
              blockExplorerUrls: [...X_LAYER_TESTNET.blockExplorerUrls],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const fetchAllFanBalances = async (
    address: string,
    providerToUse?: ethers.BrowserProvider
  ) => {
    try {
      const contractProvider = providerToUse || provider;
      if (!contractProvider) return;
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const next: Record<FanTokenSymbol, string> = { ARG: "0", BRA: "0", FRA: "0" };
      for (const sym of FAN_TOKEN_ORDER) {
        const addr = FAN_TOKEN_ADDRESSES[sym];
        if (!addr) continue;
        try {
          const token = new ethers.Contract(addr, erc20Abi, contractProvider);
          const [bal, dec] = await Promise.all([
            token.balanceOf(address),
            token.decimals(),
          ]);
          next[sym] = ethers.formatUnits(bal, dec);
        } catch (err) {
          console.warn(`Failed to fetch ${sym} balance:`, err);
          next[sym] = "0";
        }
      }
      setFanBalances(next);
    } catch (err) {
      console.error("Error fetching fan balances:", err);
      setError("Failed to fetch fan token balances");
    }
  };

  const fetchOkbBalance = async (
    address: string,
    providerToUse?: ethers.BrowserProvider
  ) => {
    try {
      const contractProvider = providerToUse || provider;
      if (!contractProvider) return;
      const balance = await contractProvider.getBalance(address);
      setOkbBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error("Error fetching OKB balance:", err);
      setOkbBalance("0");
      setError("Failed to fetch OKB balance");
    }
  };

  const initializeContract = async () => {
    try {
      setIsLoading(true);
      setError("");
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not installed");
      }
      await ensureXLayerNetwork();
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(fanArtContractAddress, fanArtABI, _signer);
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      const address = await _signer.getAddress();
      setUserAddress(address);
      setIsConnected(true);
      await fetchAllFanBalances(address, _provider);
      await fetchOkbBalance(address, _provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize contract");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (userAddress && provider) {
      await fetchAllFanBalances(userAddress, provider);
      await fetchOkbBalance(userAddress, provider);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not installed");
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await initializeContract();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setUserAddress("");
    setFanBalances({ ARG: "0", BRA: "0", FRA: "0" });
    setOkbBalance("0");
    setIsConnected(false);
    setContract(null);
    setProvider(null);
    setSigner(null);
    setError("");
  };

  const formatBalance = (balance: string, decimals: number = 2) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return "0";
    return num.toFixed(decimals);
  };

  const hasEnoughTokens = (requiredAmount: number) => {
    return FAN_TOKEN_ORDER.some(
      (sym) => parseFloat(fanBalances[sym] || "0") >= requiredAmount
    );
  };

  const getTokenRequirements = () => ({
    submit: 10,
    vote: 10,
    bid: "variable",
  });

  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            await initializeContract();
          }
        } catch (err) {
          console.log("Auto-connect failed:", err);
        }
      }
    };
    autoConnect();
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (isConnected && accounts[0] !== userAddress) {
          setUserAddress(accounts[0]);
          if (provider) {
            await fetchAllFanBalances(accounts[0], provider);
            await fetchOkbBalance(accounts[0], provider);
          }
        }
      };
      const handleChainChanged = () => { window.location.reload(); };
      const ethereum = window.ethereum;
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [isConnected, userAddress]);

  // Backward-compat aliases for existing consumers
  const psgBalance = Math.max(
    parseFloat(fanBalances.ARG || "0"),
    parseFloat(fanBalances.BRA || "0"),
    parseFloat(fanBalances.FRA || "0")
  ).toString();

  return {
    userAddress,
    fanBalances,
    okbBalance,
    // backward-compat aliases (used by 24 existing consumers)
    psgBalance,
    chzBalance: okbBalance,
    psgTokenAddress: FAN_TOKEN_ADDRESSES.ARG,
    isLoading,
    isConnected,
    error,
    contract,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatBalance,
    hasEnoughTokens,
    getTokenRequirements,
    ensureXLayerNetwork,
  };
};
