import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseConfig';

export interface Pool {
  id: number;
  pool_type: string;
  match_id: string;
  submission_deadline: number;
  voting_deadline: number;
  active: boolean;
  created_at: string;
}

export const usePools = () => {
  // Data states
  const [pools, setPools] = useState<Pool[]>([]);
  const [activePools, setActivePools] = useState<Pool[]>([]);
  const [inactivePools, setInactivePools] = useState<Pool[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch all pools
  const fetchPools = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Fetching pools from database...');
      
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('chain_id', 1952)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch pools: ${error.message}`);
      }

      console.log('Successfully fetched pools:', data);
      setPools(data || []);
      
      // Separate active and inactive pools
      const active = data?.filter(pool => pool.active) || [];
      const inactive = data?.filter(pool => !pool.active) || [];
      
      setActivePools(active);
      setInactivePools(inactive);
      
    } catch (err) {
      console.error('Error fetching pools:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pools');
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered pools based on current filter and search
  const getFilteredPools = () => {
    let filtered = pools;

    // Apply type filter
    switch (filterType) {
      case 'active':
        filtered = activePools;
        break;
      case 'inactive':
        filtered = inactivePools;
        break;
      default:
        filtered = pools;
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(pool => 
        pool.match_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.pool_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Get pool by ID
  const getPoolById = (id: number) => {
    return pools.find(pool => pool.id === id);
  };

  // Get pools by type
  const getPoolsByType = (type: string) => {
    return pools.filter(pool => pool.pool_type === type);
  };

  // Get pools by match ID
  const getPoolsByMatchId = (matchId: string) => {
    return pools.filter(pool => 
      pool.match_id.toLowerCase().includes(matchId.toLowerCase())
    );
  };

  // Get upcoming pools (submission deadline in the future)
  const getUpcomingPools = () => {
    const now = Math.floor(Date.now() / 1000);
    return pools.filter(pool => 
      pool.active && pool.submission_deadline > now
    );
  };

  // Get active pools (currently accepting submissions)
  const getCurrentlyActivePools = () => {
    const now = Math.floor(Date.now() / 1000);
    return pools.filter(pool => 
      pool.active && 
      pool.submission_deadline <= now && 
      pool.voting_deadline > now
    );
  };

  // Get voting pools (currently in voting phase)
  const getVotingPools = () => {
    const now = Math.floor(Date.now() / 1000);
    return pools.filter(pool => 
      pool.active && 
      pool.submission_deadline <= now && 
      pool.voting_deadline > now
    );
  };

  // Get expired pools (voting deadline passed)
  const getExpiredPools = () => {
    const now = Math.floor(Date.now() / 1000);
    return pools.filter(pool => 
      pool.voting_deadline <= now
    );
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Get pool status
  const getPoolStatus = (pool: Pool) => {
    const now = Math.floor(Date.now() / 1000);
    
    if (!pool.active) return 'Inactive';
    if (pool.submission_deadline > now) return 'Upcoming';
    if (pool.voting_deadline > now) return 'Active';
    return 'Expired';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Upcoming': return 'text-blue-600 bg-blue-100';
      case 'Expired': return 'text-gray-600 bg-gray-100';
      case 'Inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Refresh pools
  const refreshPools = () => {
    fetchPools();
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchPools();
  }, []);

  return {
    // Data
    pools,
    activePools,
    inactivePools,
    filteredPools: getFilteredPools(),
    
    // Loading states
    isLoading,
    error,
    
    // Filter states
    filterType,
    setFilterType,
    searchTerm,
    setSearchTerm,
    
    // Functions
    fetchPools,
    refreshPools,
    getPoolById,
    getPoolsByType,
    getPoolsByMatchId,
    getUpcomingPools,
    getCurrentlyActivePools,
    getVotingPools,
    getExpiredPools,
    formatDate,
    getPoolStatus,
    getStatusColor
  };
}; 