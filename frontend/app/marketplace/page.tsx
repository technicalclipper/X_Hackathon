"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Gavel,
  ShoppingBag,
  Upload,
  Timer,
  Eye,
  Heart,
  TrendingUp,
  Filter,
  Search,
  Coins,
  ChevronDown,
  User,
  Calendar,
  DollarSign,
  Trophy,
  Star,
  Zap,
  Target,
  Clock,
  Flame,
  Crown,
  Gift,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Minus,
  History,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useOwnedNFTs, OwnedNFT } from "@/hooks/database/useOwnedNFTs";
import { useWallet } from "@/components/WalletProvider";
import { useCreateAuction } from "@/hooks/contracts/useCreateAuction";
import { useAuctions } from "@/hooks/database/useAuctions";
import { useBidHistory } from "@/hooks/database/useBidHistory";
import { usePlaceBid } from "@/hooks/contracts/usePlaceBid";
import { useEndAuction } from "@/hooks/contracts/useEndAuction";

interface NFTItem {
  id: string;
  title: string;
  creator: string;
  price?: string;
  currentBid?: string;
  timeLeft?: string;
  bidders?: number;
  views: number;
  likes: number;
  imageUrl: string;
  club: string;
  type: "auction";
  rarity: "common" | "rare" | "legendary";
  category: "kit" | "moment" | "art" | "tifo" | "poster";
  tokenId?: string;
  highestBidder?: string;
}

interface UserNFT {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
  status: "listed" | "not_listed";
  club: string;
  category: string;
}

interface ActiveBid {
  id: string;
  nftTitle: string;
  bidAmount: string;
  status: "leading" | "outbid" | "won";
  timeLeft: string;
  imageUrl: string;
}

export default function NFTMarketplace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [bidAmount, setBidAmount] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [biddingNft, setBiddingNft] = useState<string | null>(null);
  const [tempBidAmount, setTempBidAmount] = useState("");
  const [listingNft, setListingNft] = useState<OwnedNFT | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);

  // Get wallet address from context
  const { userAddress, isConnected } = useWallet();

  // Create auction hook
  const {
    tokenId,
    setTokenId,
    minBid,
    setMinBid,
    requiredPsgTokens,
    setRequiredPsgTokens,
    isCreating,
    error: auctionError,
    success: auctionSuccess,
    txHash,
    createAuction,
    resetForm,
  } = useCreateAuction();

  // Auctions hook
  const {
    auctions,
    filteredAuctions,
    isLoading: auctionsLoading,
    error: auctionsError,
    searchTerm: auctionSearchTerm,
    setSearchTerm: setAuctionSearchTerm,
    filterType,
    setFilterType,
    refreshAuctions,
    formatEther,
    getPoolTypeLabel: getAuctionPoolTypeLabel,
    getGatewayUrl: getAuctionGatewayUrl,
  } = useAuctions();

  // Fetch owned NFTs
  const {
    ownedNFTs,
    filteredNFTs: filteredOwnedNFTs,
    isLoading: nftsLoading,
    error: nftsError,
    getGatewayUrl: getIPFSGatewayUrl,
    getPoolTypeLabel,
    refreshNFTs,
  } = useOwnedNFTs(userAddress);

  // Bid history hook
  const {
    bidHistory,
    isLoading: bidHistoryLoading,
    error: bidHistoryError,
    formatDateString,
    formatEther: formatEtherBid,
    getTotalBids,
    getHighestBid,
    getAverageBid,
    refreshBidHistory,
  } = useBidHistory(selectedTokenId || undefined);

  // Place bid hook
  const {
    tokenId: bidTokenId,
    setTokenId: setBidTokenId,
    bidAmount: bidAmountHook,
    setBidAmount: setBidAmountHook,
    isBidding,
    error: bidError,
    success: bidSuccess,
    txHash: bidTxHash,
    placeBid,
    resetForm: resetBidForm,
  } = usePlaceBid();

  // End auction hook
  const {
    tokenId: endAuctionTokenId,
    setTokenId: setEndAuctionTokenId,
    isEnding,
    error: endAuctionError,
    success: endAuctionSuccess,
    txHash: endAuctionTxHash,
    winnerAddress,
    finalAmount,
    endAuction,
    resetForm: resetEndAuctionForm,
  } = useEndAuction();

  // Handle successful auction creation
  useEffect(() => {
    if (auctionSuccess) {
      setListingNft(null);
      setIsPopoverOpen(false);
      refreshNFTs();
      refreshAuctions(); // Also refresh auctions to show new listing
      resetForm();
    }
  }, [auctionSuccess, refreshNFTs, refreshAuctions, resetForm]);

  // Handle successful bid placement
  useEffect(() => {
    if (bidSuccess) {
      setBiddingNft(null);
      setTempBidAmount("");
      refreshAuctions(); // Refresh auctions to show updated bid
      refreshBidHistory(); // Refresh bid history if dialog is open
      resetBidForm();
    }
  }, [bidSuccess, refreshAuctions, refreshBidHistory, resetBidForm]);

  // Handle successful auction ending
  useEffect(() => {
    if (endAuctionSuccess) {
      refreshAuctions(); // Refresh auctions to update status
      refreshNFTs(); // Refresh NFTs to update ownership
      resetEndAuctionForm();
    }
  }, [endAuctionSuccess, refreshAuctions, refreshNFTs, resetEndAuctionForm]);

  // Static NFT items replaced with real auction data from useAuctions hook

  const myNFTs: UserNFT[] = [
    {
      id: "user1",
      title: "My PSG Kit Design",
      price: "1.2 CHZ",
      imageUrl: "/nft-placeholder.jpg",
      status: "listed",
      club: "psg",
      category: "kit",
    },
    {
      id: "user2",
      title: "Stadium Celebration",
      price: "Not Listed",
      imageUrl: "/nft-placeholder.jpg",
      status: "not_listed",
      club: "psg",
      category: "moment",
    },
    {
      id: "user3",
      title: "Fan Art Masterpiece",
      price: "2.0 CHZ",
      imageUrl: "/nft-placeholder.jpg",
      status: "listed",
      club: "psg",
      category: "art",
    },
  ];

  const myActiveBids: ActiveBid[] = [
    {
      id: "bid1",
      nftTitle: "Neymar's Golden Moment",
      bidAmount: "2.5 CHZ",
      status: "leading",
      timeLeft: "2h 34m",
      imageUrl: "/nft-placeholder.jpg",
    },
    {
      id: "bid2",
      nftTitle: "Champion's Trophy",
      bidAmount: "1.8 CHZ",
      status: "outbid",
      timeLeft: "4h 12m",
      imageUrl: "/nft-placeholder.jpg",
    },
    {
      id: "bid3",
      nftTitle: "Victory Celebration",
      bidAmount: "3.2 CHZ",
      status: "won",
      timeLeft: "Ended",
      imageUrl: "/nft-placeholder.jpg",
    },
  ];

  const handleBack = () => {
    router.push("/clubroom/psg");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "leading":
        return "bg-green-500 text-white";
      case "outbid":
        return "bg-red-500 text-white";
      case "won":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-400 text-black";
    }
  };

  const handleStartBid = (nft: NFTItem) => {
    if (nft.currentBid) {
      // Calculate 10% more than current bid
      const currentBidValue = parseFloat(nft.currentBid.replace(/[^\d.]/g, ""));
      const newBidAmount = (currentBidValue * 1.1).toFixed(2);
      setTempBidAmount(newBidAmount);
      setBiddingNft(nft.id);

      // Set token ID and bid amount in the bid hook
      setBidTokenId(nft.id);
      setBidAmountHook(newBidAmount);
    }
  };

  const handleConfirmBid = async (auctionTokenId: number) => {
    const currentAuction = filteredAuctions.find(
      (auction) => auction.token_id === auctionTokenId
    );
    if (currentAuction && currentAuction.highest_bid) {
      const currentBidValue = formatEther(currentAuction.highest_bid);
      const newBidValue = parseFloat(tempBidAmount);

      if (newBidValue <= currentBidValue) {
        alert("Your bid must be higher than the current bid!");
        return;
      }
    }

    // Validate minimum bid
    if (currentAuction) {
      const minBidValue = formatEther(currentAuction.min_bid);
      const newBidValue = parseFloat(tempBidAmount);

      if (newBidValue < minBidValue) {
        alert(`Your bid must be at least ${minBidValue.toFixed(3)} CHZ!`);
        return;
      }
    }

    // Validate bid amount
    if (!tempBidAmount || tempBidAmount.trim() === "") {
      alert("Please enter a valid bid amount!");
      return;
    }

    const bidValue = parseFloat(tempBidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      alert("Please enter a valid bid amount!");
      return;
    }

    // Ensure token ID and bid amount are properly set before placing bid
    setBidTokenId(auctionTokenId.toString());
    setBidAmountHook(tempBidAmount);

    // Place the bid
    await placeBid();
  };

  const handleCancelBid = () => {
    setBiddingNft(null);
    setTempBidAmount("");
    resetBidForm(); // Reset the bid hook state
  };

  const handleStartListing = (nft: OwnedNFT) => {
    setListingNft(nft);
    resetForm(); // Reset first, then set values
    setTokenId(nft.minted_token_id.toString());
    setMinBid("");
    setRequiredPsgTokens("");
    setIsPopoverOpen(true);
  };

  const handleConfirmListing = async () => {
    if (!listingNft) return;

    // Basic validation - trim whitespace and check for valid values
    const trimmedMinBid = minBid.trim();
    const trimmedRequiredPsgTokens = requiredPsgTokens.trim();

    if (!trimmedMinBid || !trimmedRequiredPsgTokens) {
      return;
    }

    const minBidNum = parseFloat(trimmedMinBid);
    const requiredPsgTokensNum = parseFloat(trimmedRequiredPsgTokens);

    if (
      isNaN(minBidNum) ||
      minBidNum <= 0 ||
      isNaN(requiredPsgTokensNum) ||
      requiredPsgTokensNum <= 0
    ) {
      return;
    }

    await createAuction();
  };

  const handleCancelListing = () => {
    setListingNft(null);
    setIsPopoverOpen(false);
    resetForm();
  };

  const handleOpenBidHistory = (tokenId: number) => {
    setSelectedTokenId(tokenId);
    setHistoryDialogOpen(true);
  };

  const handleCloseBidHistory = () => {
    setHistoryDialogOpen(false);
    setSelectedTokenId(null);
  };

  const handleEndAuction = async (tokenId: number) => {
    // Prevent multiple calls if already ending
    if (isEnding) {
      return;
    }

    // Set the token ID and call endAuction directly
    setEndAuctionTokenId(tokenId.toString());
    // Call endAuction directly to avoid multiple calls
    await endAuction();
  };

  // Update search term in auctions hook when local search changes
  useEffect(() => {
    setAuctionSearchTerm(searchTerm);
  }, [searchTerm, setAuctionSearchTerm]);

  // Filter auctions based on UI filters (category, club, type)
  const filteredNFTs = filteredAuctions.filter((auction) => {
    const matchesCategory =
      selectedCategory === "all" ||
      auction.pool_type.toLowerCase() === selectedCategory;
    const matchesClub = selectedClub === "all"; // All auctions are PSG for now
    const matchesType = selectedType === "all" || selectedType === "auction";
    return matchesCategory && matchesClub && matchesType;
  });

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-4 border-border p-0">
            <CardHeader className="bg-black text-white p-0">
              {/* Top Navigation Bar */}
              <div className="bg-gray-900 px-6 py-3 border-b-2 border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleBack}
                      variant="noShadow"
                      className="bg-white text-black border-2 border-border hover:bg-gray-100 p-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="bg-white px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="text-black font-black text-sm tracking-wider">
                        FANVAS
                      </span>
                    </div>
                    <span className="text-gray-400 font-mono text-sm">
                      / NFT MARKETPLACE
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <Coins className="w-4 h-4" />
                      <span>125.5 CHZ</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <Trophy className="w-4 h-4" />
                      <span>{nftsLoading ? "..." : ownedNFTs.length} NFTs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Header Content */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-wider mb-2">
                      NFT MARKETPLACE
                    </CardTitle>
                    <p className="text-sm font-mono opacity-80">
                      BUY, SELL & AUCTION YOUR PSG COLLECTIBLES
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <span>VOLUME: 1,234 CHZ</span>
                    </div>
                    <div className="bg-white text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <span>ACTIVE: 47 AUCTIONS</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex gap-2 bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {[
              { id: "marketplace", label: "MARKETPLACE", icon: ShoppingBag },
              { id: "my-nfts", label: "MY NFTs", icon: ImageIcon },
              { id: "my-bids", label: "MY BIDS", icon: Gavel },
              { id: "sell", label: "YOUR LISTINGS", icon: Upload },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="noShadow"
                className={`flex-1 font-black text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                    : "bg-white text-black border-2 border-black hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Marketplace Tab */}
        {activeTab === "marketplace" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Search and Filters */}
            <div className="mb-6">
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Search NFTs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 border-2 border-black font-black"
                        />
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="noShadow"
                          className="bg-white border-2 border-black font-black"
                        >
                          CATEGORY <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {["all", "kit", "moment", "art", "tifo", "poster"].map(
                          (category) => (
                            <DropdownMenuItem
                              key={category}
                              onClick={() => setSelectedCategory(category)}
                              className="font-black text-black hover:bg-black hover:text-white"
                            >
                              {category.toUpperCase()}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="noShadow"
                          className="bg-white border-2 border-black font-black"
                        >
                          TYPE <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {["all", "auction"].map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className="font-black text-black hover:bg-black hover:text-white"
                          >
                            {type.toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="noShadow"
                          className="bg-white border-2 border-black font-black"
                        >
                          SORT <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {[
                          "latest",
                          "price_low",
                          "price_high",
                          "ending_soon",
                          "most_popular",
                        ].map((sort) => (
                          <DropdownMenuItem
                            key={sort}
                            onClick={() => setSortBy(sort)}
                            className="font-black text-black hover:bg-black hover:text-white"
                          >
                            {sort.replace("_", " ").toUpperCase()}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Auction Loading State */}
            {auctionsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl font-black text-black">
                    LOADING AUCTIONS...
                  </p>
                </div>
              </div>
            )}

            {/* Auction Error State */}
            {auctionsError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-4xl font-black mb-4">
                    ERROR
                  </div>
                  <p className="text-black font-bold mb-4">{auctionsError}</p>
                  <Button
                    onClick={refreshAuctions}
                    className="bg-black text-white font-black border-2 border-border"
                  >
                    RETRY
                  </Button>
                </div>
              </div>
            )}

            {/* Auction Grid */}
            {!auctionsLoading && !auctionsError && (
              <>
                {filteredNFTs.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-black text-black mb-2">
                        NO AUCTIONS FOUND
                      </p>
                      <p className="text-gray-600 mb-4">
                        No active auctions match your search criteria.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNFTs.map((auction, index) => (
                      <motion.div
                        key={auction.token_id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer h-[480px] flex flex-col overflow-hidden">
                          <CardContent className="p-0 flex flex-col h-full">
                            {/* NFT Image */}
                            <div className="relative">
                              <div className="h-48 bg-gray-200 border-b-4 border-black overflow-hidden">
                                {auction.content_url ? (
                                  <img
                                    src={getAuctionGatewayUrl(
                                      auction.content_url
                                    )}
                                    alt={`${
                                      auction.match_id
                                    } - ${getAuctionPoolTypeLabel(
                                      auction.pool_type
                                    )}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const fallback =
                                        target.nextElementSibling as HTMLElement;
                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`absolute inset-0 flex items-center justify-center ${
                                    auction.content_url ? "hidden" : ""
                                  }`}
                                >
                                  <ImageIcon className="w-16 h-16 text-gray-400" />
                                </div>
                              </div>

                              {/* Type Badge */}
                              <Badge className="absolute top-2 right-2 bg-red-500 text-white border-2 border-black font-black">
                                AUCTION
                              </Badge>
                            </div>

                            {/* Auction Details */}
                            <div className="p-4 pb-6 flex flex-col flex-grow">
                              {/* Title and Button Row */}
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-lg pr-2">
                                  {auction.match_id} -{" "}
                                  {getAuctionPoolTypeLabel(auction.pool_type)}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() =>
                                      handleOpenBidHistory(auction.token_id)
                                    }
                                    className="bg-gray-200 text-black border-2 border-black font-black p-1 text-xs hover:bg-gray-300 transition-colors rounded-none"
                                  >
                                    <History className="w-3 h-3" />
                                  </Button>
                                  {biddingNft ===
                                  auction.token_id.toString() ? (
                                    <div className="flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                      <Button
                                        onClick={handleCancelBid}
                                        className="bg-red-500 text-white border-2 border-black font-black h-8 px-2 text-xs hover:bg-red-600 transition-colors rounded-none border-r-0"
                                      >
                                        ✕
                                      </Button>
                                      <Input
                                        type="number"
                                        value={tempBidAmount}
                                        onChange={(e) => {
                                          setTempBidAmount(e.target.value);
                                          setBidAmountHook(e.target.value);
                                        }}
                                        className="w-20 h-8 text-sm border-2 border-black font-black text-center rounded-none border-x-0"
                                        step="0.01"
                                      />
                                      <Button
                                        onClick={() =>
                                          handleConfirmBid(auction.token_id)
                                        }
                                        disabled={isBidding}
                                        className="bg-green-500 text-white border-2 border-black font-black h-8 px-2 text-xs hover:bg-green-600 transition-colors rounded-none border-l-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isBidding ? "..." : "✓"}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      onClick={() =>
                                        handleStartBid({
                                          id: auction.token_id.toString(),
                                          currentBid: auction.highest_bid
                                            ? `${formatEther(
                                                auction.highest_bid
                                              ).toFixed(3)} CHZ`
                                            : `${formatEther(
                                                auction.min_bid
                                              ).toFixed(3)} CHZ`,
                                        } as NFTItem)
                                      }
                                      className="bg-main text-white border-2 border-black font-black py-1 px-3 text-sm hover:bg-gray-800 transition-colors rounded-none"
                                    >
                                      <Gavel className="w-3 h-3 mr-1" />
                                      PLACE BID
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                by {auction.creator_address.slice(0, 6)}...
                                {auction.creator_address.slice(-4)}
                              </p>

                              {/* Auction Info Fields */}
                              <div className="mb-4 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    TOKEN ID
                                  </span>
                                  <span className="text-sm font-black">
                                    {auction.token_id}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    HIGHEST BIDDER
                                  </span>
                                  <span className="text-sm font-black">
                                    {auction.highest_bidder_address
                                      ? `${auction.highest_bidder_address.slice(
                                          0,
                                          6
                                        )}...${auction.highest_bidder_address.slice(
                                          -4
                                        )}`
                                      : "No bids yet"}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    CURRENT BID
                                  </span>
                                  <span className="text-lg font-black">
                                    {auction.highest_bid
                                      ? `${formatEther(
                                          auction.highest_bid
                                        ).toFixed(3)} CHZ`
                                      : `${formatEther(auction.min_bid).toFixed(
                                          3
                                        )} CHZ`}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    MIN BID
                                  </span>
                                  <span className="text-sm font-black">
                                    {formatEther(auction.min_bid).toFixed(3)}{" "}
                                    CHZ
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    VOTES
                                  </span>
                                  <span className="text-sm font-black">
                                    {auction.vote_count}
                                  </span>
                                </div>
                              </div>

                              {/* Bidding Status Messages */}
                              {biddingNft === auction.token_id.toString() && (
                                <div className="mt-2 space-y-1">
                                  {bidError && (
                                    <div className="text-xs font-black text-red-500 bg-red-50 p-2 border border-red-200 rounded">
                                      {bidError}
                                    </div>
                                  )}
                                  {bidSuccess && (
                                    <div className="text-xs font-black text-green-500 bg-green-50 p-2 border border-green-200 rounded">
                                      {bidSuccess}
                                    </div>
                                  )}
                                  {bidTxHash && (
                                    <div className="text-xs font-black text-blue-500 bg-blue-50 p-2 border border-blue-200 rounded">
                                      TX: {bidTxHash.slice(0, 10)}...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* My NFTs Tab */}
        {activeTab === "my-nfts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Loading State */}
            {nftsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl font-black text-black">
                    LOADING YOUR NFTs...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {nftsError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-4xl font-black mb-4">
                    ERROR
                  </div>
                  <p className="text-black font-bold mb-4">{nftsError}</p>
                  <Button
                    onClick={refreshNFTs}
                    className="bg-black text-white font-black border-2 border-border"
                  >
                    RETRY
                  </Button>
                </div>
              </div>
            )}

            {/* NFTs Grid */}
            {!nftsLoading && !nftsError && (
              <>
                {!isConnected ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-xl font-black text-black mb-2">
                        WALLET NOT CONNECTED
                      </p>
                      <p className="text-gray-600 mb-4">
                        Please connect your wallet to view your NFTs.
                      </p>
                      <Button
                        onClick={() => router.push("/")}
                        className="bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                      >
                        CONNECT WALLET
                      </Button>
                    </div>
                  </div>
                ) : filteredOwnedNFTs.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-black text-black mb-2">
                        NO NFTs FOUND
                      </p>
                      <p className="text-gray-600 mb-4">
                        No NFTs found for this address.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOwnedNFTs.map((nft, index) => (
                      <motion.div
                        key={nft.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                      >
                        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 h-[480px] flex flex-col">
                          <CardContent className="p-0 flex flex-col h-full">
                            {/* NFT Image */}
                            <div className="relative">
                              <div className="h-48 bg-gray-200 border-b-4 border-black overflow-hidden">
                                {nft.content_url ? (
                                  <img
                                    src={getIPFSGatewayUrl(nft.content_url)}
                                    alt={`NFT #${nft.minted_token_id}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const fallback =
                                        target.nextElementSibling as HTMLElement;
                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`absolute inset-0 flex items-center justify-center ${
                                    nft.content_url ? "hidden" : ""
                                  }`}
                                >
                                  <ImageIcon className="w-16 h-16 text-gray-400" />
                                </div>
                              </div>

                              {/* Status Badge */}
                              <Badge className="absolute top-2 right-2 bg-gray-500 text-white border-2 border-black font-black">
                                OWNED
                              </Badge>
                            </div>

                            {/* NFT Details */}
                            <div className="p-4 flex flex-col flex-grow">
                              <h3 className="font-black text-lg mb-2">
                                {nft.match_id} -{" "}
                                {getPoolTypeLabel(nft.pool_type)}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                TOKEN ID: {nft.minted_token_id}
                              </p>

                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    CREATOR
                                  </span>
                                  <span className="text-sm font-black">
                                    {nft.creator_address.slice(0, 6)}...
                                    {nft.creator_address.slice(-4)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    VOTES
                                  </span>
                                  <span className="text-sm font-black">
                                    {nft.vote_count}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-black text-gray-600">
                                    MINTED
                                  </span>
                                  <span className="text-sm font-black">
                                    {new Date(
                                      nft.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons - Always at bottom */}
                              <div className="flex gap-2 mt-auto">
                                <Popover
                                  open={
                                    isPopoverOpen && listingNft?.id === nft.id
                                  }
                                  onOpenChange={(open) => {
                                    if (!open) {
                                      handleCancelListing();
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      onClick={() => handleStartListing(nft)}
                                      className="flex-1 bg-green-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      LIST FOR SALE
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80 text-main-foreground">
                                    <div className="grid gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-black leading-none">
                                          CREATE AUCTION
                                        </h4>
                                        <p className="text-sm">
                                          Set the auction parameters for your
                                          NFT.
                                        </p>
                                      </div>
                                      <div className="grid gap-3">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                          <Label
                                            htmlFor="token-id"
                                            className="font-black"
                                          >
                                            Token ID
                                          </Label>
                                          <Input
                                            id="token-id"
                                            value={tokenId}
                                            disabled
                                            className="col-span-2 h-8 bg-gray-100 font-black"
                                          />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                          <Label
                                            htmlFor="min-bid"
                                            className="font-black"
                                          >
                                            Min Bid (CHZ)
                                          </Label>
                                          <Input
                                            id="min-bid"
                                            type="number"
                                            value={minBid}
                                            onChange={(e) =>
                                              setMinBid(e.target.value)
                                            }
                                            placeholder="0.01"
                                            className="col-span-2 h-8 font-black"
                                            step="0.01"
                                            min="0"
                                          />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                          <Label
                                            htmlFor="psg-tokens"
                                            className="font-black"
                                          >
                                            PSG Tokens
                                          </Label>
                                          <Input
                                            id="psg-tokens"
                                            type="number"
                                            value={requiredPsgTokens}
                                            onChange={(e) =>
                                              setRequiredPsgTokens(
                                                e.target.value
                                              )
                                            }
                                            placeholder="100"
                                            className="col-span-2 h-8 font-black"
                                            step="0.01"
                                            min="0"
                                          />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={handleCancelListing}
                                            className="flex-1 bg-gray-100 text-black border-2 border-black font-black hover:bg-gray-200 transition-colors"
                                          >
                                            CANCEL
                                          </Button>
                                          <Button
                                            onClick={handleConfirmListing}
                                            disabled={
                                              isCreating ||
                                              !minBid.trim() ||
                                              !requiredPsgTokens.trim() ||
                                              isNaN(
                                                parseFloat(minBid.trim())
                                              ) ||
                                              parseFloat(minBid.trim()) <= 0 ||
                                              isNaN(
                                                parseFloat(
                                                  requiredPsgTokens.trim()
                                                )
                                              ) ||
                                              parseFloat(
                                                requiredPsgTokens.trim()
                                              ) <= 0
                                            }
                                            className="flex-1 bg-green-500 text-white border-2 border-black font-black hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {isCreating
                                              ? "CREATING..."
                                              : "CREATE AUCTION"}
                                          </Button>
                                        </div>
                                        {auctionError && (
                                          <p className="text-red-500 text-xs font-black">
                                            {auctionError}
                                          </p>
                                        )}
                                        {auctionSuccess && (
                                          <p className="text-green-500 text-xs font-black">
                                            {auctionSuccess}
                                          </p>
                                        )}
                                        {txHash && (
                                          <p className="text-blue-500 text-xs font-black">
                                            TX: {txHash.slice(0, 10)}...
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* My Bids Tab */}
        {activeTab === "my-bids" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myActiveBids.map((bid, index) => (
                <motion.div
                  key={bid.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 h-[480px] flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* NFT Image */}
                      <div className="relative">
                        <div className="h-48 bg-gray-200 border-b-4 border-black flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={`absolute top-2 right-2 ${getStatusColor(
                            bid.status
                          )} border-2 border-black font-black`}
                        >
                          {bid.status.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Bid Details */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-black text-lg mb-2">
                          {bid.nftTitle}
                        </h3>

                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-black text-gray-600">
                            YOUR BID
                          </span>
                          <span className="text-lg font-black">
                            {bid.bidAmount}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-black text-gray-600">
                            TIME LEFT
                          </span>
                          <span className="text-sm font-black text-red-500">
                            {bid.timeLeft}
                          </span>
                        </div>

                        {/* Action Button - Always at bottom */}
                        <div className="mt-auto">
                          <Button className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                            {bid.status === "outbid" ? (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                INCREASE BID
                              </>
                            ) : bid.status === "won" ? (
                              <>
                                <Trophy className="w-4 h-4 mr-2" />
                                CLAIM NFT
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                VIEW AUCTION
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Your Listings Tab */}
        {activeTab === "sell" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Loading State */}
            {auctionsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-xl font-black text-black">
                    LOADING YOUR LISTINGS...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {auctionsError && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-4xl font-black mb-4">
                    ERROR
                  </div>
                  <p className="text-black font-bold mb-4">{auctionsError}</p>
                  <Button
                    onClick={refreshAuctions}
                    className="bg-black text-white font-black border-2 border-border"
                  >
                    RETRY
                  </Button>
                </div>
              </div>
            )}

            {/* User's Active Auctions */}
            {!auctionsLoading && !auctionsError && (
              <>
                {!isConnected ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-xl font-black text-black mb-2">
                        WALLET NOT CONNECTED
                      </p>
                      <p className="text-gray-600 mb-4">
                        Please connect your wallet to view your listings.
                      </p>
                      <Button
                        onClick={() => router.push("/")}
                        className="bg-blue-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                      >
                        CONNECT WALLET
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const userAuctions = filteredAuctions.filter(
                        (auction) =>
                          auction.creator_address.toLowerCase() ===
                          userAddress?.toLowerCase()
                      );

                      return userAuctions.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-xl font-black text-black mb-2">
                              NO ACTIVE LISTINGS
                            </p>
                            <p className="text-gray-600 mb-4">
                              You don't have any active auctions. List your NFTs
                              from the "MY NFTs" tab.
                            </p>
                            <Button
                              onClick={() => setActiveTab("my-nfts")}
                              className="bg-green-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                            >
                              VIEW MY NFTs
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userAuctions.map((auction, index) => (
                            <motion.div
                              key={auction.token_id}
                              initial={{ y: 50, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 h-[520px] flex flex-col">
                                <CardContent className="p-0 flex flex-col h-full">
                                  {/* NFT Image */}
                                  <div className="relative">
                                    <div className="h-48 bg-gray-200 border-b-4 border-black overflow-hidden">
                                      {auction.content_url ? (
                                        <img
                                          src={getAuctionGatewayUrl(
                                            auction.content_url
                                          )}
                                          alt={`${
                                            auction.match_id
                                          } - ${getAuctionPoolTypeLabel(
                                            auction.pool_type
                                          )}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            const fallback =
                                              target.nextElementSibling as HTMLElement;
                                            if (fallback) {
                                              fallback.style.display = "flex";
                                            }
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`absolute inset-0 flex items-center justify-center ${
                                          auction.content_url ? "hidden" : ""
                                        }`}
                                      >
                                        <ImageIcon className="w-16 h-16 text-gray-400" />
                                      </div>
                                    </div>

                                    {/* Status Badge */}
                                    <Badge className="absolute top-2 right-2 bg-blue-500 text-white border-2 border-black font-black">
                                      YOUR LISTING
                                    </Badge>
                                  </div>

                                  {/* Auction Details */}
                                  <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-black text-lg mb-2">
                                      {auction.match_id} -{" "}
                                      {getAuctionPoolTypeLabel(
                                        auction.pool_type
                                      )}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                      TOKEN ID: {auction.token_id}
                                    </p>

                                    {/* Auction Info */}
                                    <div className="space-y-2 mb-4">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-600">
                                          CURRENT BID
                                        </span>
                                        <span className="text-lg font-black">
                                          {auction.highest_bid
                                            ? `${formatEther(
                                                auction.highest_bid
                                              ).toFixed(3)} CHZ`
                                            : `${formatEther(
                                                auction.min_bid
                                              ).toFixed(3)} CHZ`}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-600">
                                          MIN BID
                                        </span>
                                        <span className="text-sm font-black">
                                          {formatEther(auction.min_bid).toFixed(
                                            3
                                          )}{" "}
                                          CHZ
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-600">
                                          HIGHEST BIDDER
                                        </span>
                                        <span className="text-sm font-black">
                                          {auction.highest_bidder_address
                                            ? `${auction.highest_bidder_address.slice(
                                                0,
                                                6
                                              )}...${auction.highest_bidder_address.slice(
                                                -4
                                              )}`
                                            : "No bids yet"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-600">
                                          VOTES
                                        </span>
                                        <span className="text-sm font-black">
                                          {auction.vote_count}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-auto">
                                      <Button
                                        onClick={() =>
                                          handleOpenBidHistory(auction.token_id)
                                        }
                                        className="flex-1 bg-gray-200 text-black border-2 border-black font-black hover:bg-gray-300 transition-colors"
                                      >
                                        <History className="w-4 h-4 mr-2" />
                                        VIEW BIDS
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleEndAuction(auction.token_id)
                                        }
                                        disabled={isEnding}
                                        className="flex-1 bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isEnding ? (
                                          "ENDING..."
                                        ) : (
                                          <>
                                            <Gavel className="w-4 h-4 mr-2" />
                                            END AUCTION
                                          </>
                                        )}
                                      </Button>
                                    </div>

                                    {/* Status Messages */}
                                    {endAuctionError && (
                                      <div className="mt-2 text-xs font-black text-red-500 bg-red-50 p-2 border border-red-200 rounded">
                                        {endAuctionError}
                                      </div>
                                    )}
                                    {endAuctionSuccess && (
                                      <div className="mt-2 text-xs font-black text-green-500 bg-green-50 p-2 border border-green-200 rounded">
                                        {endAuctionSuccess}
                                      </div>
                                    )}
                                    {endAuctionTxHash && (
                                      <div className="mt-2 text-xs font-black text-blue-500 bg-blue-50 p-2 border border-blue-200 rounded">
                                        TX: {endAuctionTxHash.slice(0, 10)}...
                                      </div>
                                    )}
                                    {winnerAddress && (
                                      <div className="mt-2 text-xs font-black text-green-500 bg-green-50 p-2 border border-green-200 rounded">
                                        Winner: {winnerAddress.slice(0, 6)}...
                                        {winnerAddress.slice(-4)}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      );
                    })()}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Bid History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              BID HISTORY - TOKEN #{selectedTokenId}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              View all bids placed on this auction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {bidHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-black text-black">
                    LOADING HISTORY...
                  </p>
                </div>
              </div>
            ) : bidHistoryError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-red-500 text-xl font-black mb-2">
                    ERROR
                  </div>
                  <p className="text-sm text-black">{bidHistoryError}</p>
                  <Button
                    onClick={refreshBidHistory}
                    className="mt-4 bg-black text-white font-black border-2 border-black"
                  >
                    RETRY
                  </Button>
                </div>
              </div>
            ) : bidHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-black text-black mb-2">
                    NO BIDS YET
                  </p>
                  <p className="text-sm text-gray-600">
                    This auction hasn't received any bids yet.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Bid Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center">
                      <div className="text-2xl font-black text-black">
                        {getTotalBids()}
                      </div>
                      <div className="text-sm font-black text-gray-600">
                        TOTAL BIDS
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center">
                      <div className="text-2xl font-black text-black">
                        {getHighestBid()
                          ? formatEtherBid(getHighestBid()!.amount).toFixed(3)
                          : "0"}
                      </div>
                      <div className="text-sm font-black text-gray-600">
                        HIGHEST BID
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-center">
                      <div className="text-2xl font-black text-black">
                        {getAverageBid()
                          ? formatEtherBid(getAverageBid().toString()).toFixed(
                              3
                            )
                          : "0"}
                      </div>
                      <div className="text-sm font-black text-gray-600">
                        AVERAGE BID
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bid History List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bidHistory.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        index === 0 ? "bg-green-50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black text-xs ${
                              index === 0
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {index === 0 ? "1st" : `${index + 1}`}
                          </div>
                          <div>
                            <p className="font-black text-black">
                              {bid.bidder_address.slice(0, 6)}...
                              {bid.bidder_address.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatDateString(bid.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-black">
                            {formatEtherBid(bid.amount).toFixed(3)} CHZ
                          </p>
                          {index === 0 && (
                            <Badge className="bg-green-500 text-white border-2 border-black font-black text-xs">
                              LEADING BID
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
