"use client";

import { useAuctions } from '@/hooks/database/useAuctions';

export default function AuctionsPage() {
  const {
    // Data
    auctions,
    filteredAuctions,
    
    // Loading states
    isLoading,
    error,
    
    // Filter states
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    
    // Functions
    fetchAuctions,
    refreshAuctions,
    formatDate,
    formatDateString,
    formatEther,
    getPoolTypeLabel,
    getGatewayUrl
  } = useAuctions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          NFT Auctions
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Auctions</h3>
            <p className="text-3xl font-bold text-blue-600">{auctions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Active Auctions</h3>
            <p className="text-3xl font-bold text-green-600">
              {auctions.filter(auction => auction.active).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Value</h3>
            <p className="text-3xl font-bold text-purple-600">
              {auctions.reduce((total, auction) => {
                const minBid = parseFloat(auction.min_bid) / 1e18;
                return total + minBid;
              }, 0).toFixed(3)} ETH
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'active' | 'ended')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Auctions</option>
                <option value="active">Active Only</option>
                <option value="ended">Ended Only</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by match ID, type, token ID, or seller..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={refreshAuctions}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

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
            <p className="text-gray-600 mt-4">Loading auctions...</p>
          </div>
        )}

        {/* Auctions Grid */}
        {!isLoading && (
          <div className="space-y-6">
            {filteredAuctions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">
                  {auctions.length === 0 
                    ? "No auctions found" 
                    : "No auctions match your search criteria"
                  }
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {auctions.length === 0 
                    ? "NFT owners can put their NFTs up for auction" 
                    : "Try adjusting your search terms or filters"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map((auction) => (
                  <div key={auction.token_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* NFT Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={getGatewayUrl(auction.content_url)}
                        alt={`NFT ${auction.minted_token_id}`}
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
                    
                    {/* Auction Details */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          Token #{auction.minted_token_id}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          auction.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {auction.active ? 'Active' : 'Ended'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Match:</span> {auction.match_id}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span> {getPoolTypeLabel(auction.pool_type)}
                        </p>
                        <p>
                          <span className="font-medium">Min Bid:</span> {formatEther(auction.min_bid)} ETH
                        </p>
                        <p>
                          <span className="font-medium">Required PSG:</span> {formatEther(auction.required_psg_tokens)} PSG
                        </p>
                        {auction.highest_bid && (
                          <p>
                            <span className="font-medium">Current Bid:</span> {formatEther(auction.highest_bid)} ETH
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Seller:</span><br />
                          <span className="font-mono text-xs">
                            {auction.seller_address.slice(0, 6)}...{auction.seller_address.slice(-4)}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Created:</span><br />
                          {formatDateString(auction.created_at)}
                        </p>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                        <button
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Place Bid
                        </button>
                        <button
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">How Auctions Work:</h3>
          <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
            <li>NFT owners can put their NFTs up for auction</li>
            <li>Bidders need to have the required PSG tokens to participate</li>
            <li>Bids are made in ETH (native currency)</li>
            <li>Highest bidder wins when auction ends</li>
            <li>NFT is transferred to winner, ETH goes to seller</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 