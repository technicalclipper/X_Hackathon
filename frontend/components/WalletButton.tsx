"use client";

import React from 'react';
import { useWallet } from './WalletProvider';
import { Shield, Wallet, LogOut, RefreshCw } from 'lucide-react';

export const WalletButton: React.FC = () => {
  const {
    userAddress,
    isConnected,
    isConnecting,
    psgBalance,
    error,
    connectWallet,
    disconnectWallet,
    refreshPsgBalance
  } = useWallet();

  // Show loading state while auto-connecting or manually connecting
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-sm">Connecting...</span>
      </div>
    );
  }

  // Show connected state with wallet info
  if (isConnected && userAddress) {
    return (
      <div className="flex items-center gap-3">
        {/* PSG Balance */}
        <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {parseFloat(psgBalance).toFixed(2)} PSG
            </span>
            <button
              onClick={refreshPsgBalance}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-mono text-gray-800">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </span>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnectWallet}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Disconnect</span>
        </button>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-2">
          <span className="text-sm text-red-800">{error}</span>
        </div>
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Show connect button if not connected
  return (
    <button
      onClick={connectWallet}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </button>
  );
}; 