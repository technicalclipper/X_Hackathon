import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseConfig";

export interface Auction {
  token_id: number;
  seller_address: string;
  min_bid: string;
  required_psg_tokens: string;
  highest_bid: string | null;
  highest_bidder_address: string | null;
  active: boolean;
  created_at: string;
  // Joined data from nft_mints
  nft_mint_id: number;
  submission_id: number;
  minted_token_id: string;
  mint_tx_hash: string;
  nft_created_at: string;
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

export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "active" | "ended">(
    "all"
  );

  // Fetch auctions
  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Fetching auctions...");

      // First get all auctions
      const { data: auctionsData, error: auctionsError } = await supabase
        .from("auctions")
        .select("*")
        .eq("chain_id", 1952)
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (auctionsError) {
        console.error("Supabase error:", auctionsError);
        throw new Error(`Failed to fetch auctions: ${auctionsError.message}`);
      }

      // Then get all NFT mints with their related data
      const { data: nftMintsData, error: nftMintsError } = await supabase.from(
        "nft_mints"
      ).select(`
          id,
          submission_id,
          minted_token_id,
          mint_tx_hash,
          created_at,
          submissions(
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
        `).eq("chain_id", 1952);

      if (nftMintsError) {
        console.error("Supabase error:", nftMintsError);
        throw new Error(`Failed to fetch NFT mints: ${nftMintsError.message}`);
      }

      // Join the data in application layer
      const joinedData =
        auctionsData
          ?.map((auction) => {
            const nftMint = nftMintsData?.find(
              (nft) => nft.minted_token_id === auction.token_id.toString()
            );

            if (!nftMint) {
              console.warn(
                `No NFT mint found for auction token_id: ${auction.token_id}`
              );
              return null;
            }

            return {
              ...auction,
              nft_mints: nftMint,
            };
          })
          .filter(Boolean) || [];

      // Transform the data to flatten the structure
      const transformedData: Auction[] =
        joinedData?.map((auction: any) => ({
          token_id: auction.token_id,
          seller_address: auction.seller_address,
          min_bid: auction.min_bid,
          required_psg_tokens: auction.required_psg_tokens,
          highest_bid: auction.highest_bid,
          highest_bidder_address: auction.highest_bidder_address,
          active: auction.active,
          created_at: auction.created_at,
          // NFT mint data
          nft_mint_id: auction.nft_mints.id,
          submission_id: auction.nft_mints.submission_id,
          minted_token_id: auction.nft_mints.minted_token_id,
          mint_tx_hash: auction.nft_mints.mint_tx_hash,
          nft_created_at: auction.nft_mints.created_at,
          // Submission data (nested under nft_mints)
          pool_id: auction.nft_mints.submissions.pool_id,
          creator_address: auction.nft_mints.submissions.creator_address,
          content_url: auction.nft_mints.submissions.content_url,
          contract_submission_id:
            auction.nft_mints.submissions.contract_submission_id,
          vote_count: auction.nft_mints.submissions.vote_count,
          submission_created_at: auction.nft_mints.submissions.created_at,
          // Pool data (nested under submissions)
          pool_type: auction.nft_mints.submissions.pools.pool_type,
          match_id: auction.nft_mints.submissions.pools.match_id,
          submission_deadline:
            auction.nft_mints.submissions.pools.submission_deadline,
          voting_deadline: auction.nft_mints.submissions.pools.voting_deadline,
          pool_active: auction.nft_mints.submissions.pools.active,
          pool_created_at: auction.nft_mints.submissions.pools.created_at,
        })) || [];

      console.log("Fetched auctions:", transformedData);
      setAuctions(transformedData);
    } catch (err) {
      console.error("Error fetching auctions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch auctions");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter auctions based on search term and filter type
  useEffect(() => {
    let filtered = auctions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (auction) =>
          auction.match_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.pool_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.minted_token_id.includes(searchTerm) ||
          auction.seller_address
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === "active") {
      filtered = filtered.filter((auction) => auction.active);
    } else if (filterType === "ended") {
      filtered = filtered.filter((auction) => !auction.active);
    }

    setFilteredAuctions(filtered);
  }, [auctions, searchTerm, filterType]);

  // Auto-fetch on component mount
  useEffect(() => {
    fetchAuctions();
  }, []);

  // Helper functions
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatEther = (wei: string) => {
    return parseFloat(wei) / 1e18;
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
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl.replace(
      "ipfs://",
      ""
    )}`;
  };

  const refreshAuctions = () => {
    fetchAuctions();
  };

  return {
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
    getGatewayUrl,
  };
};

export interface EndedAuction {
  token_id: number;
  seller_address: string;
  min_bid: string;
  required_psg_tokens: string;
  highest_bid: string | null;
  highest_bidder_address: string | null;
  active: boolean;
  created_at: string;
}

export const useEndedAuctions = () => {
  const [endedAuctions, setEndedAuctions] = useState<EndedAuction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchEndedAuctions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data, error } = await supabase
        .from("auctions")
        .select("*")
        .eq("chain_id", 1952)
        .eq("active", false)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      setEndedAuctions(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch ended auctions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEndedAuctions();
  }, []);

  const refreshEndedAuctions = () => {
    fetchEndedAuctions();
  };

  return {
    endedAuctions,
    isLoading,
    error,
    refreshEndedAuctions,
  };
};
