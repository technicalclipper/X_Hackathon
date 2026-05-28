import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseConfig';

export interface BidHistory {
  id: number;
  token_id: number;
  bidder_address: string;
  amount: string;
  created_at: string;
}

export const useBidHistory = (tokenId?: number) => {
  const [bidHistory, setBidHistory] = useState<BidHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch bid history
  const fetchBidHistory = async () => {
    if (!tokenId) {
      setBidHistory([]);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('Fetching bid history for token:', tokenId);

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('chain_id', 1952)
        .eq('token_id', tokenId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch bid history: ${error.message}`);
      }

      console.log('Fetched bid history:', data);
      setBidHistory(data || []);

    } catch (err) {
      console.error('Error fetching bid history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bid history');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when token ID changes
  useEffect(() => {
    fetchBidHistory();
  }, [tokenId]);

  // Helper functions
  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEther = (wei: string) => {
    return parseFloat(wei) / 1e18;
  };

  const getTotalBids = () => {
    return bidHistory.length;
  };

  const getHighestBid = () => {
    if (bidHistory.length === 0) return null;
    
    return bidHistory.reduce((highest, bid) => {
      const currentAmount = parseFloat(bid.amount);
      const highestAmount = parseFloat(highest.amount);
      return currentAmount > highestAmount ? bid : highest;
    });
  };

  const getAverageBid = () => {
    if (bidHistory.length === 0) return 0;
    
    const total = bidHistory.reduce((sum, bid) => {
      return sum + parseFloat(bid.amount);
    }, 0);
    
    return total / bidHistory.length;
  };

  const refreshBidHistory = () => {
    fetchBidHistory();
  };

  return {
    // Data
    bidHistory,
    
    // Loading states
    isLoading,
    error,
    
    // Functions
    fetchBidHistory,
    refreshBidHistory,
    formatDateString,
    formatEther,
    getTotalBids,
    getHighestBid,
    getAverageBid
  };
}; 