import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseConfig";

export interface Submission {
  id: number;
  pool_id: number;
  creator_address: string;
  content_url: string;
  contract_submission_id?: number;
  vote_count: number;
  created_at: string;
}

export const useSubmissions = (poolId?: number) => {
  // Data states
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch submissions
  const fetchSubmissions = async (targetPoolId?: number) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Fetching submissions from database...", { targetPoolId });

      let query = supabase
        .from("submissions")
        .select("*")
        .eq("chain_id", 1952)
        .order("created_at", { ascending: false });

      // Filter by pool ID if provided
      if (targetPoolId) {
        console.log("Filtering by pool ID:", targetPoolId);
        query = query.eq("pool_id", targetPoolId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to fetch submissions: ${error.message}`);
      }

      console.log("Successfully fetched submissions:", data);
      setSubmissions(data || []);
      setFilteredSubmissions(data || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch submissions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered submissions based on search
  const getFilteredSubmissions = () => {
    if (!searchTerm.trim()) {
      return submissions;
    }

    return submissions.filter((submission) =>
      submission.creator_address
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  };

  // Get submission by ID
  const getSubmissionById = (id: number) => {
    return submissions.find((submission) => submission.id === id);
  };

  // Get submissions by creator address
  const getSubmissionsByCreator = (creatorAddress: string) => {
    return submissions.filter(
      (submission) =>
        submission.creator_address.toLowerCase() ===
        creatorAddress.toLowerCase()
    );
  };

  // Get submissions by pool ID
  const getSubmissionsByPool = (targetPoolId: number) => {
    return submissions.filter(
      (submission) => submission.pool_id === targetPoolId
    );
  };

  // Get top voted submissions
  const getTopVotedSubmissions = (limit: number = 10) => {
    return [...submissions]
      .sort((a, b) => b.vote_count - a.vote_count)
      .slice(0, limit);
  };

  // Get recent submissions
  const getRecentSubmissions = (limit: number = 10) => {
    return [...submissions]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get IPFS gateway URL
  const getGatewayUrl = (cid: string) => {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  };

  // Refresh submissions
  const refreshSubmissions = () => {
    fetchSubmissions(poolId);
  };

  // Update search filter
  const updateSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = getFilteredSubmissions();
    setFilteredSubmissions(filtered);
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchSubmissions(poolId);
  }, [poolId]);

  // Update filtered submissions when search changes
  useEffect(() => {
    const filtered = getFilteredSubmissions();
    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions]);

  return {
    // Data
    submissions,
    filteredSubmissions,

    // Loading states
    isLoading,
    error,

    // Filter states
    searchTerm,
    setSearchTerm: updateSearch,

    // Functions
    fetchSubmissions,
    refreshSubmissions,
    getSubmissionById,
    getSubmissionsByCreator,
    getSubmissionsByPool,
    getTopVotedSubmissions,
    getRecentSubmissions,
    formatDate,
    getGatewayUrl,
  };
};
