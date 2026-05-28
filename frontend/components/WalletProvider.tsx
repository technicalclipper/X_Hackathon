"use client";

import React, { createContext, useContext } from "react";
import { usePsgBalance } from "@/hooks/usePsgBalance";

interface WalletContextType {
  userAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  contract: any;
  provider: any;
  signer: any;
  fanBalances: { ARG: string; BRA: string; FRA: string };
  okbBalance: string;
  psgBalance: string;
  chzBalance: string;
  psgTokenAddress: string;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshPsgBalance: () => Promise<void>;
  ensureXLayerNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const psgBalanceHook = usePsgBalance();

  const value: WalletContextType = {
    userAddress: psgBalanceHook.userAddress,
    isConnected: psgBalanceHook.isConnected,
    isConnecting: psgBalanceHook.isLoading,
    contract: psgBalanceHook.contract,
    provider: psgBalanceHook.provider,
    signer: psgBalanceHook.signer,
    fanBalances: psgBalanceHook.fanBalances,
    okbBalance: psgBalanceHook.okbBalance,
    psgBalance: psgBalanceHook.psgBalance,
    chzBalance: psgBalanceHook.chzBalance,
    psgTokenAddress: psgBalanceHook.psgTokenAddress,
    error: psgBalanceHook.error,
    connectWallet: psgBalanceHook.connectWallet,
    disconnectWallet: psgBalanceHook.disconnectWallet,
    refreshPsgBalance: psgBalanceHook.refreshBalance,
    ensureXLayerNetwork: psgBalanceHook.ensureXLayerNetwork,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
