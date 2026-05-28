"use client";

import { useState } from 'react';
import { usePools } from '@/hooks/database/usePools';
import { useSubmissions } from '@/hooks/database/useSubmissions';
import { useSubmitToPool } from '@/hooks/contracts/useSubmitToPool';
import { useVote } from '@/hooks/contracts/useVote';
import { useVoteCounts } from '@/hooks/database/useVoteCounts';
import { useMintWinner } from '@/hooks/contracts/useMintWinner';

export default function ShowPoolsPage() {
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null);
  const [showSubmissions, setShowSubmissions] = useState<boolean>(false);
  const [showCreateSubmission, setShowCreateSubmission] = useState<boolean>(false);

  const {
    // Data
    pools,
    activePools,
    inactivePools,
    filteredPools,
    
    // Loading states
    isLoading,
    error,
    
    // Filter states
    filterType,
    setFilterType,
    searchTerm,
    setSearchTerm,
    
    // Functions
    refreshPools,
    getUpcomingPools,
    getCurrentlyActivePools,
    getVotingPools,
    getExpiredPools,
    formatDate,
    getPoolStatus,
    getStatusColor
  } = usePools();

  const {
    // Data
    submissions,
    filteredSubmissions,
    
    // Loading states
    isLoading: isLoadingSubmissions,
    error: submissionsError,
    
    // Filter states
    searchTerm: submissionSearchTerm,
    setSearchTerm: setSubmissionSearchTerm,
    
    // Functions
    refreshSubmissions,
    formatDate: formatSubmissionDate,
    getGatewayUrl
  } = useSubmissions(selectedPoolId || undefined);

  const {
    // Contract state
    userAddress,
    userPsgBalance,
    
    // Form states
    poolDetails,
    
    // Loading states
    isSubmitting,
    error: submitError,
    success,

    // Transaction states
    txHash,
    submissionId,

    // IPFS states
    selectedFile,
    uploadedCID,
    isUploading,
    uploadError,
    uploadProgress,
    fileValidation,

    // Functions
    submitToPool,
    resetForm,
    handlePoolSelect,
    formatDate: formatPoolDate,
    getPoolStatus: getSubmitPoolStatus,

    // IPFS functions
    uploadToPinata,
    handleFileSelect,
    resetUpload,
    getGatewayUrl: getSubmitGatewayUrl
  } = useSubmitToPool();

  const {
    // Contract state
    userAddress: voteUserAddress,
    userPsgBalance: voteUserPsgBalance,

    // Loading states
    isVoting,
    error: voteError,
    success: voteSuccess,

    // Transaction states
    txHash: voteTxHash,

    // Functions
    vote,
    resetSuccess
  } = useVote();

  const {
    voteCounts,
    isLoading: isLoadingVoteCounts,
    error: voteCountsError,
    getVoteCount,
    hasUserVoted,
    hasUserVotedInPool,
    refreshVoteCounts
  } = useVoteCounts(selectedPoolId || undefined);

  const {
    // Contract state
    userAddress: mintUserAddress,
    isOwner,

    // Loading states
    isMinting,
    error: mintError,
    success: mintSuccess,

    // Transaction states
    txHash: mintTxHash,
    mintedTokenId,
    winnerSubmissionId,
    winnerAddress,

    // Functions
    mintWinner,
    isPoolReadyForMinting,
    getPoolDetails: getMintPoolDetails
  } = useMintWinner();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Available Pools
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Pools</h3>
            <p className="text-3xl font-bold text-blue-600">{pools.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Active Pools</h3>
            <p className="text-3xl font-bold text-green-600">{activePools.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming</h3>
            <p className="text-3xl font-bold text-blue-600">{getUpcomingPools().length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-700">Expired</h3>
            <p className="text-3xl font-bold text-gray-600">{getExpiredPools().length}</p>
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
                onChange={(e) => setFilterType(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Pools</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by match ID or type..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={refreshPools}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Mint User Address: {mintUserAddress || 'Not connected'}</p>
            <p>Is Owner: {isOwner ? 'Yes' : 'No'}</p>
            {/* Connect Wallet for Mint */}
            {!mintUserAddress && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Connect wallet to mint</p>
              </div>
            )}
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
            <p className="text-gray-600 mt-4">Loading pools...</p>
          </div>
        )}

        {/* Pools List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredPools.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No pools found</p>
                <p className="text-gray-500 text-sm mt-2">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create some pools to get started'}
                </p>
              </div>
            ) : (
              filteredPools.map((pool) => {
                const status = getPoolStatus(pool);
                const statusColor = getStatusColor(status);
                
                return (
                  <div key={pool.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Pool Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">
                            Pool #{pool.id}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Type:</span> {pool.pool_type}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Match ID:</span> {pool.match_id}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              <span className="font-medium">Submission Deadline:</span><br />
                              {formatDate(pool.submission_deadline)}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Voting Deadline:</span><br />
                              {formatDate(pool.voting_deadline)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Created: {new Date(pool.created_at).toLocaleString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPoolId(pool.id);
                            setShowSubmissions(true);
                            setShowCreateSubmission(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          View Submissions
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedPoolId(pool.id);
                            setShowCreateSubmission(true);
                            setShowSubmissions(false);
                            handlePoolSelect(pool.id);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          Submit Content
                        </button>
                        
                        {/* End Event Button - Only show for contract owner */}
                        {isOwner ? (
                          <button 
                            onClick={async () => {
                              await mintWinner(pool.id);
                            }}
                            disabled={isMinting || !mintUserAddress}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 text-sm"
                          >
                            {isMinting ? 'Minting Winner...' : 'End Event & Mint Winner'}
                          </button>
                        ) : (
                          <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs text-center">
                            Only owner can mint
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && pools.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Currently Active:</p>
                <p className="font-semibold text-green-600">{getCurrentlyActivePools().length}</p>
              </div>
              <div>
                <p className="text-gray-600">In Voting Phase:</p>
                <p className="font-semibold text-blue-600">{getVotingPools().length}</p>
              </div>
              <div>
                <p className="text-gray-600">Upcoming:</p>
                <p className="font-semibold text-blue-600">{getUpcomingPools().length}</p>
              </div>
              <div>
                <p className="text-gray-600">Expired:</p>
                <p className="font-semibold text-gray-600">{getExpiredPools().length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Display */}
        {showSubmissions && selectedPoolId && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Submissions for Pool #{selectedPoolId}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={refreshSubmissions}
                  disabled={isLoadingSubmissions}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {isLoadingSubmissions ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setShowSubmissions(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Submissions Search */}
            <div className="mb-4">
              <input
                type="text"
                value={submissionSearchTerm}
                onChange={(e) => setSubmissionSearchTerm(e.target.value)}
                placeholder="Search submissions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Debug Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-sm">
              <p><strong>Debug Info:</strong></p>
              <p>Selected Pool ID: {selectedPoolId}</p>
              <p>Total Submissions: {submissions.length}</p>
              <p>Filtered Submissions: {filteredSubmissions.length}</p>
              <p>Loading: {isLoadingSubmissions ? 'Yes' : 'No'}</p>
              {submissionsError && <p className="text-red-600">Error: {submissionsError}</p>}
            </div>

            {/* Submissions List */}
            {isLoadingSubmissions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No submissions found for this pool</p>
                <p className="text-sm text-gray-500 mt-2">Pool ID: {selectedPoolId}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Image Preview */}
                      <div className="flex-shrink-0">
                        <img
                          src={getGatewayUrl(submission.content_url)}
                          alt="Submission content"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Submission Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">
                            Submission #{submission.id}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {submission.vote_count} votes
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Creator:</span> {submission.creator_address}
                        </p>
                        

                        
                        <p className="text-xs text-gray-500">
                          Submitted: {formatSubmissionDate(submission.created_at)}
                        </p>
                        
                        {/* Vote Button */}
                        <div className="mt-3">
                          {!voteUserAddress ? (
                            <p className="text-xs text-gray-500">Connect wallet to vote</p>
                          ) : (
                            <button
                              onClick={() => {
                                if (submission.contract_submission_id !== undefined) {
                                  vote(selectedPoolId!, submission.contract_submission_id);
                                } else {
                                  console.error('No contract submission ID found for submission:', submission.id);
                                }
                              }}
                              disabled={isVoting || submission.contract_submission_id === undefined}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-300"
                            >
                              {isVoting ? 'Voting...' : 'Vote'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Voting Error Display */}
            {voteError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{voteError}</p>
              </div>
            )}

            {/* Voting Success Display */}
            {voteSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ {voteSuccess}</p>
                {voteTxHash && (
                  <p className="text-sm text-green-600 mt-1">
                    TX: {voteTxHash}
                  </p>
                )}
              </div>
            )}

            {/* Mint Winner Error Display */}
            {mintError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{mintError}</p>
              </div>
            )}

            {/* Mint Winner Success Display */}
            {mintSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ {mintSuccess}</p>
                {mintTxHash && (
                  <p className="text-sm text-green-600 mt-1">
                    TX: {mintTxHash}
                  </p>
                )}
                {mintedTokenId && (
                  <p className="text-sm text-green-600">
                    Token ID: {mintedTokenId}
                  </p>
                )}
                {winnerAddress && (
                  <p className="text-sm text-green-600">
                    Winner: {winnerAddress.slice(0, 6)}...{winnerAddress.slice(-4)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Submission Form */}
        {showCreateSubmission && selectedPoolId && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Submit Content to Pool #{selectedPoolId}
              </h2>
              <button
                onClick={() => setShowCreateSubmission(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>

            {/* Wallet Connection */}
            {!userAddress ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Connect your wallet to submit</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Address:</span> {userAddress}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Fan Balance:</span> {userPsgBalance} Fan
                  </p>
                </div>

                {/* Pool Details */}
                {poolDetails && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Pool Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p><span className="font-medium">Type:</span> {poolDetails.poolType}</p>
                      <p><span className="font-medium">Match ID:</span> {poolDetails.matchId}</p>
                      <p><span className="font-medium">Submission Deadline:</span> {formatPoolDate(poolDetails.submissionDeadline)}</p>
                      <p><span className="font-medium">Voting Deadline:</span> {formatPoolDate(poolDetails.votingDeadline)}</p>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Content
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                      id="submission-file"
                    />
                    <label htmlFor="submission-file" className="cursor-pointer block">
                      {selectedFile ? (
                        <div>
                          <p className="text-green-600 font-medium">✓ File Selected</p>
                          <p className="text-sm mt-2">{selectedFile.name}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg">📁 Click to select an image</p>
                          <p className="text-sm text-gray-500 mt-2">Supports: JPEG, PNG, GIF, WebP</p>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  {!fileValidation.isValid && (
                    <p className="text-red-600 text-sm mt-2">{fileValidation.message}</p>
                  )}
                </div>

                {/* Upload to IPFS */}
                {selectedFile && fileValidation.isValid && !uploadedCID && (
                  <button
                    onClick={uploadToPinata}
                    disabled={isUploading}
                    className="w-full py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {isUploading ? 'Uploading to IPFS...' : 'Upload to IPFS'}
                  </button>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {/* Uploaded CID */}
                {uploadedCID && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-800">✓ Uploaded to IPFS</p>
                    <p className="text-sm text-green-600 font-mono break-all">{uploadedCID}</p>
                  </div>
                )}



                {/* Submit Button */}
                {uploadedCID && (
                  <button
                    onClick={submitToPool}
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit to Pool'}
                  </button>
                )}

                {/* Error Display */}
                {(submitError || uploadError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{submitError || uploadError}</p>
                  </div>
                )}

                {/* Success Display */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">✓ {success}</p>
                    {txHash && (
                      <p className="text-sm text-green-600 mt-1">
                        TX: {txHash}
                      </p>
                    )}
                    {submissionId && (
                      <p className="text-sm text-green-600">
                        Submission ID: {submissionId}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 