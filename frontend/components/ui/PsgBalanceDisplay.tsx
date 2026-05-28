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
    fanBalances,
    okbBalance,
    isLoading,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatBalance,
    hasEnoughTokens,
    getTokenRequirements,
  } = usePsgBalance();

  const requirements = getTokenRequirements();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading balances…</span>
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
            Connect Wallet
          </button>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Fan Token Balances</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">🇦🇷 ARG</p>
            <p className="font-bold text-blue-600">{formatBalance(fanBalances.ARG, 2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">🇧🇷 BRA</p>
            <p className="font-bold text-blue-600">{formatBalance(fanBalances.BRA, 2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">🇫🇷 FRA</p>
            <p className="font-bold text-blue-600">{formatBalance(fanBalances.FRA, 2)}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          OKB: {formatBalance(okbBalance, 4)} · {userAddress.slice(0, 6)}…{userAddress.slice(-4)}
        </p>
        <div className="flex gap-2 mt-2">
          <button onClick={refreshBalance} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Refresh</button>
          <button onClick={disconnectWallet} className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">Disconnect</button>
        </div>
      </div>

      {showRequirements && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Token Requirements (any team)</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Submit:</span>
              <span className={hasEnoughTokens(requirements.submit) ? 'text-green-600' : 'text-red-600'}>
                {requirements.submit} {hasEnoughTokens(requirements.submit) ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Vote:</span>
              <span className={hasEnoughTokens(requirements.vote) ? 'text-green-600' : 'text-red-600'}>
                {requirements.vote} {hasEnoughTokens(requirements.vote) ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bid:</span>
              <span className="text-gray-600">{requirements.bid}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
