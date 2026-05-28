import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseConfig';

export interface VoteCount {
  submission_id: number;
  vote_count: number;
}

export const useVoteCounts = (poolId?: number) => {
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch vote counts for all submissions in a pool
  const fetchVoteCounts = async (poolId: number) => {
    try {
      setIsLoading(true);
      setError('');

      // Get submissions for this pool with their contract submission IDs
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id, contract_submission_id, vote_count')
        .eq('chain_id', 1952)
        .eq('pool_id', poolId);

      if (submissionsError) {
        throw new Error(`Failed to fetch submissions: ${submissionsError.message}`);
      }

      // Create a mapping from database ID to vote count
      const counts: Record<number, number> = {};
      submissions?.forEach((submission) => {
        if (submission.contract_submission_id !== null) {
          counts[submission.id] = submission.vote_count || 0;
        }
      });

      setVoteCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vote counts');
    } finally {
      setIsLoading(false);
    }
  };

  // Get vote count for a specific submission
  const getVoteCount = (submissionId: number): number => {
    return voteCounts[submissionId] || 0;
  };

  // Check if user has voted for a specific submission (using database submission ID)
  const hasUserVoted = async (databaseSubmissionId: number, userAddress: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('chain_id', 1952)
        .eq('submission_id', databaseSubmissionId) // This is the database submission ID
        .eq('voter_address', userAddress)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to check user vote: ${error.message}`);
      }

      return !!data;
    } catch (err) {
      console.error('Error checking user vote:', err);
      return false;
    }
  };

  // Check if user has voted in a specific pool
  const hasUserVotedInPool = async (poolId: number, userAddress: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id')
        .eq('chain_id', 1952)
        .eq('pool_id', poolId)
        .eq('voter_address', userAddress)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to check user vote in pool: ${error.message}`);
      }

      return !!data;
    } catch (err) {
      console.error('Error checking user vote in pool:', err);
      return false;
    }
  };

  // Refresh vote counts
  const refreshVoteCounts = () => {
    if (poolId) {
      fetchVoteCounts(poolId);
    }
  };

  // Auto-fetch when poolId changes
  useEffect(() => {
    if (poolId) {
      fetchVoteCounts(poolId);
    }
  }, [poolId]);

  return {
    voteCounts,
    isLoading,
    error,
    getVoteCount,
    hasUserVoted,
    hasUserVotedInPool,
    refreshVoteCounts,
    fetchVoteCounts
  };
}; 