"use client";

import { usePools } from '@/hooks/database/usePools';

export default function ShowPoolsPage() {
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
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                          View Details
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                          Submit Content
                        </button>
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
      </div>
    </div>
  );
} 