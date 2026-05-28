import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseConfig";

export interface OwnedNFT {
  id: number;
  submission_id: number;
  minted_token_id: string;
  mint_tx_hash: string;
  created_at: string;
  current_owner_address: string;
  // Joined data from submissions
  pool_id: number;
  creator_address: string;
  content_url: string;
  contract_submission_id: number;
  vote_count: number;
  submission_created_at: string;
  // Joined data from pools
  pool_type: string;
  match_id: string;
  submission_deadline: number;
  voting_deadline: number;
  pool_active: boolean;
  pool_created_at: string;
}

export const useOwnedNFTs = (ownerAddress?: string) => {
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filteredNFTs, setFilteredNFTs] = useState<OwnedNFT[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "all" | "tifo" | "match_video" | "jersey" | "tickets"
  >("all");

  // Fetch owned NFTs
  const fetchOwnedNFTs = async () => {
    if (!ownerAddress) {
      setOwnedNFTs([]);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("Fetching owned NFTs for address:", ownerAddress);

      // Query NFTs based on current_owner_address instead of original creator
      const { data, error } = await supabase
        .from("nft_mints")
        .select(
          `
          *,
          submissions!inner(
            id,
            pool_id,
            creator_address,
            content_url,
            contract_submission_id,
            vote_count,
            created_at,
            pools(
              id,
              pool_type,
              match_id,
              submission_deadline,
              voting_deadline,
              active,
              created_at
            )
          )
        `
        )
        .eq("chain_id", 1952)
        .eq("current_owner_address", ownerAddress);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to fetch owned NFTs: ${error.message}`);
      }

      // Transform the data to flatten the structure
      const transformedData: OwnedNFT[] =
        data?.map((nft: any) => ({
          id: nft.id,
          submission_id: nft.submission_id,
          minted_token_id: nft.minted_token_id,
          mint_tx_hash: nft.mint_tx_hash,
          created_at: nft.created_at,
          current_owner_address: nft.current_owner_address,
          // Submission data
          pool_id: nft.submissions.pool_id,
          creator_address: nft.submissions.creator_address,
          content_url: nft.submissions.content_url,
          contract_submission_id: nft.submissions.contract_submission_id,
          vote_count: nft.submissions.vote_count,
          submission_created_at: nft.submissions.created_at,
          // Pool data (nested under submissions)
          pool_type: nft.submissions.pools.pool_type,
          match_id: nft.submissions.pools.match_id,
          submission_deadline: nft.submissions.pools.submission_deadline,
          voting_deadline: nft.submissions.pools.voting_deadline,
          pool_active: nft.submissions.pools.active,
          pool_created_at: nft.submissions.pools.created_at,
        })) || [];

      console.log("Fetched owned NFTs:", transformedData);
      setOwnedNFTs(transformedData);
    } catch (err) {
      console.error("Error fetching owned NFTs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch owned NFTs"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Filter NFTs based on search term and filter type
  useEffect(() => {
    let filtered = ownedNFTs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (nft) =>
          nft.match_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.pool_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.minted_token_id.includes(searchTerm)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(
        (nft) => nft.pool_type.toLowerCase() === filterType.toLowerCase()
      );
    }

    setFilteredNFTs(filtered);
  }, [ownedNFTs, searchTerm, filterType]);

  // Auto-fetch when owner address changes
  useEffect(() => {
    fetchOwnedNFTs();
  }, [ownerAddress]);

  // Helper functions
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPoolTypeLabel = (poolType: string) => {
    switch (poolType.toUpperCase()) {
      case "TIFO":
        return "TIFO";
      case "MATCH_VIDEO":
        return "Match Video";
      case "JERSEY":
        return "Jersey";
      case "TICKETS":
        return "Tickets";
      default:
        return poolType;
    }
  };

  const getGatewayUrl = (ipfsUrl: string) => {
    if (!ipfsUrl) return "";
    if (ipfsUrl.startsWith("http")) return ipfsUrl;
    return `https://tan-adjacent-mammal-701.mypinata.cloud/ipfs/${ipfsUrl.replace(
      "ipfs://",
      ""
    )}`;
  };

  const refreshNFTs = () => {
    fetchOwnedNFTs();
  };

  return {
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
    getGatewayUrl,
  };
};
