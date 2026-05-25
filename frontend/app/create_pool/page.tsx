"use client";

import { useCreatePool, PoolType } from '@/hooks/contracts/useCreatePool';
import { useWallet } from '@/components/WalletProvider';

export default function CreatePoolPage() {
  const { isConnected } = useWallet();
  
  const {
    // Contract state
    userAddress,
    isOwner,
    
    // Form states
    poolType,
    setPoolType,
    matchId,
    setMatchId,
    submissionDeadline,
    setSubmissionDeadline,
    votingDeadline,
    setVotingDeadline,
    
    // Loading states
    isCreating,
    error,
    success,
    
    // Transaction states
    txHash,
    poolId,
    
    // Functions
    createPool,
    resetForm,
    getPoolTypeLabel
  } = useCreatePool();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPool();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Create Fan Pool
        </h1>

        {/* Wallet Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Please connect your wallet to create pools</p>
              <p className="text-sm text-gray-500">Use the wallet button in the top right corner</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {userAddress}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  isOwner 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isOwner ? 'Owner (Can create pools)' : 'User (Cannot create pools)'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Create Pool Form */}
        {isConnected && isOwner && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Pool Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pool Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pool Type
                </label>
                <select
                  value={poolType}
                  onChange={(e) => setPoolType(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={PoolType.TIFO}>TIFO</option>
                  <option value={PoolType.MATCH_VIDEO}>Match Video</option>
                  <option value={PoolType.JERSEY}>Jersey</option>
                  <option value={PoolType.TICKETS}>Tickets</option>
                </select>
              </div>

              {/* Match ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match ID
                </label>
                <input
                  type="text"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  placeholder="e.g., PSG_vs_BAR_2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submission Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Deadline
                </label>
                <input
                  type="datetime-local"
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Voting Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voting Deadline
                </label>
                <input
                  type="datetime-local"
                  value={votingDeadline}
                  onChange={(e) => setVotingDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCreating}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isCreating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isCreating ? 'Creating Pool...' : 'Create Pool'}
              </button>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">
              ✅ Pool Created Successfully!
            </h3>
            
            <div className="space-y-3">
              {poolId && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Pool ID:</p>
                  <p className="text-sm text-green-600 font-mono">{poolId}</p>
                </div>
              )}
              
              {txHash && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Transaction Hash:</p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700">Pool Type:</p>
                <p className="text-sm text-gray-600">{getPoolTypeLabel(poolType)}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Match ID:</p>
                <p className="text-sm text-gray-600">{matchId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Connect your wallet (must be contract owner)</li>
            <li>Select pool type (TIFO, Match Video, Jersey, Tickets)</li>
            <li>Enter match ID (e.g., PSG_vs_BAR_2024)</li>
            <li>Set submission deadline (must be in the future)</li>
            <li>Set voting deadline (must be after submission deadline)</li>
            <li>Click "Create Pool" and confirm transaction</li>
            <li>Check the transaction hash and pool ID</li>
          </ol>
        </div>

        {/* Reset Button */}
        {(success || error) && (
          <div className="text-center mt-6">
            <button
              onClick={resetForm}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset Form
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
