"use client";

import { useState } from 'react';
import { useAuctions } from '@/hooks/database/useAuctions';
import { usePlaceBid } from '@/hooks/contracts/usePlaceBid';
import { useBidHistory } from '@/hooks/database/useBidHistory';
import { useEndAuction } from '@/hooks/contracts/useEndAuction';
import { useEndedAuctions } from '@/hooks/database/useAuctions';
import { useWallet } from '@/components/WalletProvider';

export default function AuctionsPage() {
  const { userAddress, isConnected } = useWallet();
  const [showBidForm, setShowBidForm] = useState<boolean>(false);
  const [showBidHistory, setShowBidHistory] = useState<boolean>(false);
  const [showEndAuctionForm, setShowEndAuctionForm] = useState<boolean>(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);

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

  const {
    // Form states
    tokenId,
    setTokenId,
    bidAmount,
    setBidAmount,
    
    // Loading states
    isBidding,
    error: bidError,
    success: bidSuccess,
    
    // Transaction states
    txHash: bidTxHash,
    
    // Functions
    placeBid,
    resetForm: resetBidForm
  } = usePlaceBid();

  const {
    // Data
    bidHistory,
    
    // Loading states
    isLoading: isBidHistoryLoading,
    error: bidHistoryError,
    
    // Functions
    fetchBidHistory,
    refreshBidHistory,
    formatDateString: formatBidDate,
    formatEther: formatBidEther,
    getTotalBids,
    getHighestBid,
    getAverageBid
  } = useBidHistory(selectedAuction?.token_id);

  const {
    // Form states
    tokenId: endAuctionTokenId,
    setTokenId: setEndAuctionTokenId,
    
    // Loading states
    isEnding,
    error: endAuctionError,
    success: endAuctionSuccess,
    
    // Transaction states
    txHash: endAuctionTxHash,
    winnerAddress,
    finalAmount,
    
    // Functions
    endAuction,
    resetForm: resetEndAuctionForm
  } = useEndAuction();

  const {
    endedAuctions,
    isLoading: isEndedLoading,
    error: endedError,
    refreshEndedAuctions,
  } = useEndedAuctions();

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

        {/* Wallet Connection Status */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Wallet Status:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
            {isConnected && <p>Address: {userAddress}</p>}
            <p>Total Auctions: {auctions.length}</p>
            <p>Auctions with seller addresses: {auctions.filter(a => a.seller_address).length}</p>
          </div>
          {!isConnected && (
            <div className="mt-3">
              <p className="text-sm text-yellow-700">Please connect your wallet to interact with auctions</p>
            </div>
          )}
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
                          onClick={() => {
                            setSelectedAuction(auction);
                            setTokenId(auction.minted_token_id);
                            setShowBidForm(true);
                          }}
                          disabled={!auction.active || !isConnected}
                          className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                            auction.active && isConnected
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {!isConnected ? 'Connect Wallet to Bid' : auction.active ? 'Place Bid' : 'Auction Ended'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAuction(auction);
                            setShowBidHistory(true);
                          }}
                          className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          View Details
                        </button>
                        
                        {/* End Auction Button - Only show for auction owner */}
                        {auction.active && auction.seller_address.toLowerCase() === userAddress?.toLowerCase() && (
                          <button
                            onClick={() => {
                              setSelectedAuction(auction);
                              setEndAuctionTokenId(auction.minted_token_id);
                              setShowEndAuctionForm(true);
                            }}
                            className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            End Auction
                          </button>
                        )}
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

        {/* Bidding Form Modal */}
        {showBidForm && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Place Bid
                </h3>
                <button
                  onClick={() => {
                    setShowBidForm(false);
                    setSelectedAuction(null);
                    resetBidForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Auction Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Token ID:</span> {selectedAuction.minted_token_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Match:</span> {selectedAuction.match_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {getPoolTypeLabel(selectedAuction.pool_type)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Min Bid:</span> {formatEther(selectedAuction.min_bid)} ETH
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Required PSG:</span> {formatEther(selectedAuction.required_psg_tokens)} PSG
                </p>
                {selectedAuction.highest_bid && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Bid:</span> {formatEther(selectedAuction.highest_bid)} ETH
                  </p>
                )}
              </div>

              {/* Wallet Connection Status */}
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Please connect your wallet to place bids</p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  placeBid();
                }} className="space-y-4">
                  {/* Bid Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bid Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0.01"
                      min={formatEther(selectedAuction.min_bid)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least {formatEther(selectedAuction.min_bid)} ETH
                      {selectedAuction.highest_bid && ` and higher than ${formatEther(selectedAuction.highest_bid)} ETH`}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isBidding}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isBidding ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </form>
              )}

              {/* Error Display */}
              {bidError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{bidError}</p>
                </div>
              )}

              {/* Success Display */}
              {bidSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">✓ {bidSuccess}</p>
                  {bidTxHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${bidTxHash}`}
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

        {/* Bid History Modal */}
        {showBidHistory && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bid History - Token #{selectedAuction.minted_token_id}
                </h3>
                <button
                  onClick={() => {
                    setShowBidHistory(false);
                    setSelectedAuction(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Auction Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Match:</span> {selectedAuction.match_id}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {getPoolTypeLabel(selectedAuction.pool_type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Min Bid:</span> {formatEther(selectedAuction.min_bid)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Required PSG:</span> {formatEther(selectedAuction.required_psg_tokens)} PSG
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedAuction.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAuction.active ? 'Active' : 'Ended'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Seller:</span> {selectedAuction.seller_address.slice(0, 6)}...{selectedAuction.seller_address.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bid Statistics */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800">Total Bids</h4>
                  <p className="text-2xl font-bold text-blue-600">{getTotalBids()}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800">Highest Bid</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {getHighestBid() ? `${formatBidEther(getHighestBid()!.amount)} ETH` : 'No bids'}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800">Average Bid</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {getTotalBids() > 0 ? `${(formatBidEther(getAverageBid().toString())).toFixed(4)} ETH` : 'No bids'}
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              <div className="mb-4 flex justify-end">
                <button
                  onClick={refreshBidHistory}
                  disabled={isBidHistoryLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isBidHistoryLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {/* Error Display */}
              {bidHistoryError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{bidHistoryError}</p>
                </div>
              )}

              {/* Bid History Table */}
              {isBidHistoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading bid history...</p>
                </div>
              ) : bidHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No bids placed yet</p>
                  <p className="text-sm text-gray-500 mt-2">Be the first to place a bid!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          #
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Bidder
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Amount (ETH)
                        </th>
                        <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidHistory.map((bid, index) => (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600 font-mono">
                            {bid.bidder_address.slice(0, 6)}...{bid.bidder_address.slice(-4)}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600 font-medium">
                            {formatBidEther(bid.amount)} ETH
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {formatBidDate(bid.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* End Auction Form Modal */}
        {showEndAuctionForm && selectedAuction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  End Auction
                </h3>
                <button
                  onClick={() => {
                    setShowEndAuctionForm(false);
                    setSelectedAuction(null);
                    resetEndAuctionForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Auction Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Token ID:</span> {selectedAuction.minted_token_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Match:</span> {selectedAuction.match_id}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {getPoolTypeLabel(selectedAuction.pool_type)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Min Bid:</span> {formatEther(selectedAuction.min_bid)} ETH
                </p>
                {selectedAuction.highest_bid && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Highest Bid:</span> {formatEther(selectedAuction.highest_bid)} ETH
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total Bids:</span> {getTotalBids()}
                </p>
              </div>

              {/* Warning */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">⚠️ Warning:</span> Ending an auction will:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>Transfer the NFT to the highest bidder (if any bids were placed)</li>
                  <li>Send the ETH proceeds to you</li>
                  <li>Close the auction permanently</li>
                </ul>
              </div>

              {/* Wallet Connection Status */}
              {!isConnected ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Please connect your wallet to end auctions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Confirmation */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to end this auction?
                    </p>
                    <button
                      onClick={endAuction}
                      disabled={isEnding}
                      className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
                    >
                      {isEnding ? 'Ending Auction...' : 'End Auction'}
                    </button>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {endAuctionError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{endAuctionError}</p>
                </div>
              )}

              {/* Success Display */}
              {endAuctionSuccess && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">✓ {endAuctionSuccess}</p>
                  {endAuctionTxHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${endAuctionTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all block mt-1"
                    >
                      View Transaction
                    </a>
                  )}
                  {winnerAddress && (
                    <p className="text-sm text-green-600 mt-1">
                      Winner: {winnerAddress.slice(0, 6)}...{winnerAddress.slice(-4)}
                    </p>
                  )}
                  {finalAmount && (
                    <p className="text-sm text-green-600">
                      Final Amount: {parseFloat(finalAmount) / 1e18} ETH
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ended Auctions Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Ended Auctions</h2>
          <div className="mb-4 flex justify-end">
            <button
              onClick={refreshEndedAuctions}
              disabled={isEndedLoading}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
            >
              {isEndedLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {endedError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{endedError}</p>
            </div>
          )}
          {isEndedLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading ended auctions...</p>
            </div>
          ) : endedAuctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No ended auctions found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedAuctions.map((auction) => (
                <div key={auction.token_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">
                        Token #{auction.token_id}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Ended
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Seller:</span><br />
                        <span className="font-mono text-xs">{auction.seller_address.slice(0, 6)}...{auction.seller_address.slice(-4)}</span>
                      </p>
                      <p>
                        <span className="font-medium">Winner:</span><br />
                        {auction.highest_bidder_address ? (
                          <span className="font-mono text-xs">{auction.highest_bidder_address.slice(0, 6)}...{auction.highest_bidder_address.slice(-4)}</span>
                        ) : (
                          <span className="text-gray-400">No bids</span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Final Amount:</span> {auction.highest_bid ? `${parseFloat(auction.highest_bid) / 1e18} ETH` : '0 ETH'}
                      </p>
                      <p>
                        <span className="font-medium">Ended At:</span> {formatDateString(auction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 