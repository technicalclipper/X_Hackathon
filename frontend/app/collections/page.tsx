"use client";

import { useState } from 'react';
import { useOwnedNFTs } from '@/hooks/database/useOwnedNFTs';
import { useCreateAuction } from '@/hooks/contracts/useCreateAuction';
import { useWallet } from '@/components/WalletProvider';

export default function DemoMarketPage() {
  const { userAddress, isConnected } = useWallet();
  const [showAuctionForm, setShowAuctionForm] = useState<boolean>(false);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  const {
    // Data
    ownedNFTs,
    filteredNFTs,
    
    // Loading states
    isLoading,
    error,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    
    // Functions
    fetchOwnedNFTs,
    refreshNFTs,
    formatDate,
    formatDateString,
    getPoolTypeLabel,
    getGatewayUrl
  } = useOwnedNFTs(userAddress);

  const {
    // Form states
    tokenId,
    setTokenId,
    minBid,
    setMinBid,
    requiredPsgTokens,
    setRequiredPsgTokens,
    
    // Loading states
    isCreating,
    error: auctionError,
    success: auctionSuccess,
    
    // Transaction states
    txHash: auctionTxHash,
    
    // Functions
    createAuction,
    resetForm: resetAuctionForm
  } = useCreateAuction();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Demo Market - Your Owned NFTs
        </h1>

        {/* Wallet Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          
          {!isConnected ? (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">Please connect your wallet to view your NFTs</p>
              <p className="text-sm text-gray-500">Use the wallet button in the top right corner</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {userAddress}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Total NFTs:</span> {ownedNFTs.length}
              </p>
              <p className="text-sm text-blue-600">
                <span className="font-medium">Note:</span> This page shows NFTs you currently own. 
                If you've sold NFTs in auctions, they won't appear here.
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        {isConnected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Filter */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'tifo' | 'match_video' | 'jersey' | 'tickets')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="tifo">TIFO</option>
                  <option value="match_video">Match Video</option>
                  <option value="jersey">Jersey</option>
                  <option value="tickets">Tickets</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Search:</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by match ID, type, or token ID..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Refresh */}
              <button
                onClick={refreshNFTs}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your NFTs...</p>
          </div>
        )}

        {/* NFTs Grid */}
        {isConnected && !isLoading && (
          <div className="space-y-6">
            {filteredNFTs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">
                  {ownedNFTs.length === 0 
                    ? "You don't own any NFTs yet" 
                    : "No NFTs match your search criteria"
                  }
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {ownedNFTs.length === 0 
                    ? "Win some pools to get your first NFT!" 
                    : "Try adjusting your search terms or filters"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNFTs.map((nft) => (
                  <div key={nft.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* NFT Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={getGatewayUrl(nft.content_url)}
                        alt={`NFT ${nft.minted_token_id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          ((e.currentTarget as HTMLElement).nextElementSibling as HTMLElement)!.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-gray-400">
                        <span>Image not available</span>
                      </div>
                    </div>
                    
                    {/* NFT Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          Token #{nft.minted_token_id}
                        </h3>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                          {getPoolTypeLabel(nft.pool_type)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Match:</span> {nft.match_id}
                        </p>
                        <p>
                          <span className="font-medium">Pool ID:</span> {nft.pool_id}
                        </p>
                        <p>
                          <span className="font-medium">Votes Won:</span> {nft.vote_count}
                        </p>
                        <p>
                          <span className="font-medium">Minted:</span><br />
                          {formatDateString(nft.created_at)}
                        </p>
                      </div>
                      
                      {/* Transaction Link */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${nft.mint_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          View Transaction
                        </a>
                      </div>
                      
                      {/* Put to Auction Button */}
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedNFT(nft);
                            setTokenId(nft.minted_token_id);
                            setShowAuctionForm(true);
                          }}
                          className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                        >
                          Put to Auction
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {isConnected && ownedNFTs.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your NFT Collection Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Total NFTs:</p>
                <p className="font-semibold text-blue-600">{ownedNFTs.length}</p>
              </div>
              <div>
                <p className="text-gray-600">TIFO NFTs:</p>
                <p className="font-semibold text-green-600">
                  {ownedNFTs.filter(nft => nft.pool_type.toLowerCase() === 'tifo').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Match Videos:</p>
                <p className="font-semibold text-blue-600">
                  {ownedNFTs.filter(nft => nft.pool_type.toLowerCase() === 'match_video').length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Other Types:</p>
                <p className="font-semibold text-purple-600">
                  {ownedNFTs.filter(nft => 
                    !['tifo', 'match_video'].includes(nft.pool_type.toLowerCase())
                  ).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How to Get NFTs:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Connect your wallet</li>
            <li>Go to "Show Pools" and submit content to active pools</li>
            <li>Get votes from other users</li>
            <li>If you win, the pool creator will mint an NFT for you</li>
            <li>Your NFTs will appear here in your collection</li>
          </ol>
        </div>

        {/* Auction Form Modal */}
        {showAuctionForm && selectedNFT && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Put NFT to Auction
                </h3>
                <button
                  onClick={() => {
                    setShowAuctionForm(false);
                    setSelectedNFT(null);
                    resetAuctionForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* NFT Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Token ID:</span> {selectedNFT.minted_token_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Match:</span> {selectedNFT.match_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {getPoolTypeLabel(selectedNFT.pool_type)}
                </p>
              </div>

              {/* Wallet Connection Status */}
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Please connect your wallet to create auctions</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createAuction();
                }} className="space-y-4">
                  {/* Min Bid */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Bid (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={minBid}
                      onChange={(e) => setMinBid(e.target.value)}
                      placeholder="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Required Fan Tokens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Fan Tokens
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={requiredPsgTokens}
                      onChange={(e) => setRequiredPsgTokens(e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                  >
                    {isCreating ? 'Creating Auction...' : 'Create Auction'}
                  </button>
                </form>
              )}

              {/* Error Display */}
              {auctionError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{auctionError}</p>
                </div>
              )}

              {/* Success Display */}
              {auctionSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">✓ {auctionSuccess}</p>
                  {auctionTxHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${auctionTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all block mt-1"
                    >
                      View Transaction
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 