"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  const nftItems: NFTItem[] = [
    {
      id: "1",
      title: "Neymar's Golden Moment",
      creator: "FanArt_Master",
      currentBid: "2.5 CHZ",
      timeLeft: "2h 34m",
      bidders: 12,
      views: 1240,
      likes: 89,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "legendary",
      category: "moment",
      tokenId: "PSG001",
      highestBidder: "0x1234...5678",
    },
    {
      id: "2",
      title: "PSG Third Kit Design",
      creator: "DesignGuru",
      currentBid: "1.8 CHZ",
      timeLeft: "4h 15m",
      bidders: 6,
      views: 856,
      likes: 45,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "rare",
      category: "kit",
      tokenId: "PSG002",
      highestBidder: "0x2345...6789",
    },
    {
      id: "3",
      title: "Parc des Princes Tifo",
      creator: "TifoMaster",
      currentBid: "3.2 CHZ",
      timeLeft: "1h 45m",
      bidders: 15,
      views: 2100,
      likes: 156,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "legendary",
      category: "tifo",
      tokenId: "PSG003",
      highestBidder: "0xabcd...efgh",
    },
    {
      id: "4",
      title: "Messi Magic Poster",
      creator: "ArtCollector",
      currentBid: "0.9 CHZ",
      timeLeft: "5h 30m",
      bidders: 3,
      views: 634,
      likes: 32,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "common",
      category: "poster",
      tokenId: "PSG004",
      highestBidder: "0x3456...7890",
    },
    {
      id: "5",
      title: "Champions League Glory",
      creator: "PhotoPro",
      currentBid: "4.1 CHZ",
      timeLeft: "3h 12m",
      bidders: 8,
      views: 1876,
      likes: 124,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "legendary",
      category: "moment",
      tokenId: "PSG005",
      highestBidder: "0x9876...5432",
    },
    {
      id: "6",
      title: "Fan Art Collection",
      creator: "CreativeGuru",
      currentBid: "0.5 CHZ",
      timeLeft: "7h 45m",
      bidders: 2,
      views: 423,
      likes: 28,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "common",
      category: "art",
      tokenId: "PSG006",
      highestBidder: "0x4567...8901",
    },
    {
      id: "7",
      title: "Mbappé Speed Boost",
      creator: "SpeedMaster",
      currentBid: "2.2 CHZ",
      timeLeft: "12h 20m",
      bidders: 9,
      views: 890,
      likes: 67,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "rare",
      category: "moment",
      tokenId: "PSG007",
      highestBidder: "0x5678...9012",
    },
    {
      id: "8",
      title: "PSG Stadium Night",
      creator: "PhotoArt",
      currentBid: "1.5 CHZ",
      timeLeft: "8h 10m",
      bidders: 5,
      views: 567,
      likes: 43,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "common",
      category: "art",
      tokenId: "PSG008",
      highestBidder: "0x6789...0123",
    },
    {
      id: "9",
      title: "Vintage PSG Badge",
      creator: "RetroDesigner",
      currentBid: "1.9 CHZ",
      timeLeft: "6h 22m",
      bidders: 7,
      views: 1123,
      likes: 85,
      imageUrl: "/nft-placeholder.jpg",
      club: "psg",
      type: "auction",
      rarity: "rare",
      category: "art",
      tokenId: "PSG009",
      highestBidder: "0xdef0...1234",
    },
  ];

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
    }
  };

  const handleConfirmBid = (nftId: string) => {
    const currentNft = nftItems.find((nft) => nft.id === nftId);
    if (currentNft && currentNft.currentBid) {
      const currentBidValue = parseFloat(
        currentNft.currentBid.replace(/[^\d.]/g, "")
      );
      const newBidValue = parseFloat(tempBidAmount);

      if (newBidValue <= currentBidValue) {
        alert("Your bid must be higher than the current bid!");
        return;
      }
    }

    // Here you would typically call your smart contract or API
    console.log(`Placing bid of ${tempBidAmount} CHZ on NFT ${nftId}`);
    // Reset bidding state
    setBiddingNft(null);
    setTempBidAmount("");
    // You could show a success message or update the UI
  };

  const handleCancelBid = () => {
    setBiddingNft(null);
    setTempBidAmount("");
  };

  const filteredNFTs = nftItems.filter((nft) => {
    const matchesSearch = nft.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || nft.category === selectedCategory;
    const matchesClub = selectedClub === "all" || nft.club === selectedClub;
    const matchesType = selectedType === "all" || nft.type === selectedType;
    return matchesSearch && matchesCategory && matchesClub && matchesType;
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
                      <span>8 NFTs</span>
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
              { id: "sell", label: "SELL NFT", icon: Upload },
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

            {/* NFT Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNFTs.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer h-[480px] flex flex-col overflow-hidden">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* NFT Image */}
                      <div className="relative">
                        <div className="h-48 bg-gray-200 border-b-4 border-black flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>

                        {/* Type Badge */}
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white border-2 border-black font-black">
                          AUCTION
                        </Badge>
                      </div>

                      {/* NFT Details */}
                      <div className="p-4 pb-6 flex flex-col flex-grow">
                        {/* Title and Button Row */}
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-black text-lg pr-2">
                            {nft.title}
                          </h3>
                          {biddingNft === nft.id ? (
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
                                onChange={(e) =>
                                  setTempBidAmount(e.target.value)
                                }
                                className="w-20 h-8 text-sm border-2 border-black font-black text-center rounded-none border-x-0"
                                step="0.01"
                              />
                              <Button
                                onClick={() => handleConfirmBid(nft.id)}
                                className="bg-green-500 text-white border-2 border-black font-black h-8 px-2 text-xs hover:bg-green-600 transition-colors rounded-none border-l-0"
                              >
                                ✓
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleStartBid(nft)}
                              className="bg-main text-white border-2 border-black font-black py-1 px-3 text-sm hover:bg-gray-800 transition-colors rounded-none"
                            >
                              <Gavel className="w-3 h-3 mr-1" />
                              PLACE BID
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          by {nft.creator}
                        </p>

                        {/* NFT Info Fields */}
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-gray-600">
                              TOKEN ID
                            </span>
                            <span className="text-sm font-black">
                              {nft.tokenId || nft.id}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-gray-600">
                              HIGHEST BIDDER
                            </span>
                            <span className="text-sm font-black">
                              {nft.highestBidder || "0x0000...0000"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-gray-600">
                              CURRENT BID
                            </span>
                            <span className="text-lg font-black">
                              {nft.currentBid}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-gray-600">
                              TIME LEFT
                            </span>
                            <span className="text-sm font-black text-red-500">
                              {nft.timeLeft}
                            </span>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-black text-gray-600">
                              {nft.views}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-black text-gray-600">
                              {nft.likes}
                            </span>
                          </div>
                        </div>
                        {/* Action Button - Always at bottom and inside card */}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* My NFTs Tab */}
        {activeTab === "my-nfts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNFTs.map((nft, index) => (
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
                        <div className="h-48 bg-gray-200 border-b-4 border-black flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>

                        {/* Status Badge */}
                        <Badge
                          className={`absolute top-2 right-2 ${
                            nft.status === "listed"
                              ? "bg-green-500 text-white"
                              : "bg-gray-500 text-white"
                          } border-2 border-black font-black`}
                        >
                          {nft.status === "listed" ? "LISTED" : "NOT LISTED"}
                        </Badge>
                      </div>

                      {/* NFT Details */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-black text-lg mb-2">{nft.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {nft.category.toUpperCase()}
                        </p>

                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-black text-gray-600">
                            PRICE
                          </span>
                          <span className="text-lg font-black">
                            {nft.price}
                          </span>
                        </div>

                        {/* Action Buttons - Always at bottom */}
                        <div className="flex gap-2 mt-auto">
                          {nft.status === "listed" ? (
                            <Button className="flex-1 bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                              <Minus className="w-4 h-4 mr-2" />
                              UNLIST
                            </Button>
                          ) : (
                            <Button className="flex-1 bg-green-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                              <Plus className="w-4 h-4 mr-2" />
                              LIST FOR SALE
                            </Button>
                          )}
                          <Button className="flex-1 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                            <Gavel className="w-4 h-4 mr-2" />
                            AUCTION
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

        {/* Sell NFT Tab */}
        {activeTab === "sell" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="bg-black text-white p-6">
                  <CardTitle className="text-2xl font-black tracking-wider">
                    SELL YOUR NFT
                  </CardTitle>
                  <p className="text-gray-300 font-mono text-sm">
                    LIST YOUR NFT FOR SALE OR AUCTION
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* NFT Selection */}
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        SELECT NFT TO SELL
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {myNFTs
                          .filter((nft) => nft.status === "not_listed")
                          .map((nft) => (
                            <div
                              key={nft.id}
                              className="border-4 border-black p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <div className="h-20 bg-gray-200 mb-2 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-xs font-black text-center">
                                {nft.title}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Sale Type */}
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        SALE TYPE
                      </label>
                      <div className="flex gap-4">
                        <Button
                          variant="noShadow"
                          className="flex-1 bg-white text-black border-2 border-black font-black hover:bg-gray-100"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          FIXED PRICE
                        </Button>
                        <Button
                          variant="noShadow"
                          className="flex-1 bg-white text-black border-2 border-black font-black hover:bg-gray-100"
                        >
                          <Gavel className="w-4 h-4 mr-2" />
                          AUCTION
                        </Button>
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        PRICE (CHZ)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter price in CHZ"
                        value={listingPrice}
                        onChange={(e) => setListingPrice(e.target.value)}
                        className="border-2 border-black font-black"
                      />
                    </div>

                    {/* Duration (for auctions) */}
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2">
                        AUCTION DURATION
                      </label>
                      <div className="flex gap-2">
                        {["1 DAY", "3 DAYS", "7 DAYS", "14 DAYS"].map(
                          (duration) => (
                            <Button
                              key={duration}
                              variant="noShadow"
                              className="flex-1 bg-white text-black border-2 border-black font-black hover:bg-gray-100 text-xs"
                            >
                              {duration}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black text-lg py-3">
                      <Upload className="w-5 h-5 mr-2" />
                      LIST NFT FOR SALE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
