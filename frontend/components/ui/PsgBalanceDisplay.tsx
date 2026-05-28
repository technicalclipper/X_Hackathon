import React from 'react';
import { usePsgBalance } from '@/hooks/usePsgBalance';

interface PsgBalanceDisplayProps {
  showConnectButton?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export const PsgBalanceDisplay: React.FC<PsgBalanceDisplayProps> = ({
  showConnectButton = true,
  showRequirements = false,
  className = ''
}) => {
  const {
    userAddress,
    psgBalance,
    isLoading,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatBalance,
    hasEnoughTokens,
    getTokenRequirements
  } = usePsgBalance();

  const requirements = getTokenRequirements();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading PSG balance...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {showConnectButton && (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Connect Wallet to View PSG Balance
          </button>
        )}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Balance Display */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div>
          <p className="text-sm font-medium text-gray-700">PSG Balance</p>
          <p className="text-lg font-bold text-blue-600">
            {formatBalance(psgBalance, 2)} PSG
          </p>
          <p className="text-xs text-gray-500">
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </p>
        </div>
        
        <div className="flex flex-col gap-1">
          <button
            onClick={refreshBalance}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={disconnectWallet}
            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Token Requirements */}
      {showRequirements && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Token Requirements</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Submit to Pool:</span>
              <span className={`font-medium ${hasEnoughTokens(requirements.submit) ? 'text-green-600' : 'text-red-600'}`}>
                {requirements.submit} PSG {hasEnoughTokens(requirements.submit) ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vote:</span>
              <span className={`font-medium ${hasEnoughTokens(requirements.vote) ? 'text-green-600' : 'text-red-600'}`}>
                {requirements.vote} PSG {hasEnoughTokens(requirements.vote) ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bid on Auction:</span>
              <span className="font-medium text-gray-600">
                {requirements.bid} PSG
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}; 