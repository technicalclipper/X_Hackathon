"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  ArrowLeft,
  Trophy,
  Palette,
  Users,
  Coins,
  ChevronDown,
  Menu,
  Gavel,
  Image as ImageIcon,
  FileText,
  Medal,
  Crown,
  BarChart3,
  MessageCircle,
  Gift,
  TrendingUp,
  Star,
  Upload,
  Eye,
  CheckCircle,
  PenTool,
  Zap,
  Target,
  Award,
  Calendar,
  DollarSign,
  Camera,
  Newspaper,
  Map,
  Heart,
  Sparkles,
  Bot,
  Settings,
  HelpCircle,
  LogOut,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Contest {
  id: string;
  title: string;
  description: string;
  reward: string;
  deadline: string;
  participants: number;
  type: string;
  icon: any;
}

interface NFTAuction {
  id: string;
  title: string;
  creator: string;
  currentBid: string;
  timeLeft: string;
  bidders: number;
  imageUrl: string;
}

export default function PSGClubRoom() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");

  const contests: Contest[] = [
    {
      id: "1",
      title: "PSG Third Kit Design",
      description: "Design the next PSG third kit",
      reward: "500 PSG Tokens + Official Kit",
      deadline: "5 days",
      participants: 234,
      type: "Design",
      icon: PenTool,
    },
    {
      id: "2",
      title: "Parc des Princes Tifo",
      description: "Create a tifo for the next home match",
      reward: "1,000 PSG Tokens + VIP Tickets",
      deadline: "12 days",
      participants: 89,
      type: "Art",
      icon: Palette,
    },
    {
      id: "3",
      title: "Match Day Poster",
      description: "Design poster for PSG vs Bayern",
      reward: "200 PSG Tokens",
      deadline: "3 days",
      participants: 156,
      type: "Poster",
      icon: FileText,
    },
    {
      id: "4",
      title: "Fan Footage Contest",
      description: "Best fan video from last match",
      reward: "300 PSG Tokens",
      deadline: "7 days",
      participants: 67,
      type: "Video",
      icon: Camera,
    },
  ];

  const nftAuctions: NFTAuction[] = [
    {
      id: "1",
      title: "Neymar Goal Celebration",
      creator: "FanArt_Master",
      currentBid: "2.5 CHZ",
      timeLeft: "2h 34m",
      bidders: 12,
      imageUrl: "/nft-placeholder.jpg",
    },
    {
      id: "2",
      title: "Parc des Princes Sunset",
      creator: "PSG_Photographer",
      currentBid: "1.8 CHZ",
      timeLeft: "5h 12m",
      bidders: 8,
      imageUrl: "/nft-placeholder.jpg",
    },
    {
      id: "3",
      title: "Messi Magic Moment",
      creator: "Digital_Artist",
      currentBid: "3.2 CHZ",
      timeLeft: "1h 45m",
      bidders: 15,
      imageUrl: "/nft-placeholder.jpg",
    },
  ];

  const handleBack = () => {
    router.push("/clubselect");
  };

  const menuItems = [
    {
      category: "Contests",
      items: [
        { label: "Third Kit Design", icon: PenTool, badge: "5 days left" },
        { label: "Tifo Contest", icon: Palette, badge: "12 days left" },
        { label: "Match Posters", icon: FileText, badge: "3 days left" },
        { label: "Fan Footage", icon: Camera, badge: "7 days left" },
      ],
    },
    {
      category: "NFTs",
      items: [
        { label: "Live Auctions", icon: Gavel, badge: "12 active" },
        { label: "Your Gallery", icon: ImageIcon, badge: "8 items" },
        { label: "Your Bids", icon: DollarSign, badge: "3 active" },
      ],
    },
    {
      category: "Submissions",
      items: [
        { label: "Drafts", icon: FileText, badge: "2" },
        { label: "Submitted", icon: CheckCircle, badge: "5" },
        { label: "Winners", icon: Trophy, badge: "1" },
      ],
    },
    {
      category: "Quick Access",
      items: [
        { label: "Fan Community", icon: Users, badge: "1,247 online" },
        { label: "Token Rewards", icon: Coins, badge: "125 available" },
        { label: "Club Stats", icon: BarChart3, badge: "Live" },
      ],
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
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
                      / CLUB ROOMS / PSG
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Menu Dropdowns */}
                    {menuItems.map((category, index) => (
                      <DropdownMenu key={index}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="noShadow"
                            className="bg-white text-black border-2 border-border hover:bg-gray-100 font-black text-sm"
                          >
                            {category.category}
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          {category.items.map((item, itemIndex) => (
                            <DropdownMenuItem
                              key={itemIndex}
                              className="hover:bg-black hover:text-white font-bold text-black cursor-pointer border-b-2 border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <item.icon className="w-4 h-4" />
                                <span className="font-black">{item.label}</span>
                                {item.badge && (
                                  <Badge
                                    variant="neutral"
                                    className="ml-auto text-xs bg-gray-200 text-black border-2 border-black"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ))}

                    <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <Coins className="w-4 h-4" />
                      <span>125 TOKENS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PSG Header */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 flex items-center justify-center">
                      <Image
                        src="/logos/psg.png"
                        alt="PSG Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black tracking-wider mb-2">
                        PSG CLUB ROOM
                      </CardTitle>
                      <p className="text-sm font-mono opacity-80">
                        WELCOME TO THE PARC DES PRINCES CREATIVE SPACE
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <span>RANK: #42</span>
                    </div>
                    <div className="bg-white text-black px-3 py-2 border-2 border-border font-black text-sm">
                      <span>1,247 FANS ONLINE</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Active Contests", value: "5", icon: Trophy },
              { label: "Active Fans", value: "1,247", icon: Users },
              { label: "NFT Auctions", value: "12", icon: Gavel },
              { label: "Your Rank", value: "#42", icon: Medal },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-gray-600 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-black">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center border-2 border-border">
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Main Content - Ongoing Contests as Primary */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="bg-black text-white p-6">
              <CardTitle className="text-2xl font-black tracking-wider flex items-center gap-3">
                <Trophy className="w-6 h-6" />
                ONGOING CONTESTS
              </CardTitle>
              <p className="text-gray-300 font-mono text-sm">
                JOIN THE COMPETITION AND SHOW YOUR PSG PRIDE
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contests.map((contest) => (
                  <motion.div
                    key={contest.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gray-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-border">
                          <contest.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-lg">{contest.title}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {contest.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-3 border-2 border-black mb-3">
                      <p className="text-sm font-black text-gray-800 mb-1">
                        REWARD:
                      </p>
                      <p className="text-sm font-bold text-black">
                        {contest.reward}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="neutral"
                        className="text-sm font-black bg-yellow-400 text-black border-2 border-black"
                      >
                        {contest.deadline} LEFT
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-800">
                          {contest.participants} PARTICIPANTS
                        </p>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                      JOIN CONTEST
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* NFT Marketplace Button */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-2 border-border">
                    <Gavel className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">NFT MARKETPLACE</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      BUY, SELL & TRADE PSG NFTs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-100 p-2 border-2 border-black text-center">
                    <p className="text-xs font-black text-gray-600">
                      LIVE AUCTIONS
                    </p>
                    <p className="text-lg font-black">12</p>
                  </div>
                  <div className="bg-gray-100 p-2 border-2 border-black text-center">
                    <p className="text-xs font-black text-gray-600">
                      YOUR BIDS
                    </p>
                    <p className="text-lg font-black">3</p>
                  </div>
                  <div className="bg-gray-100 p-2 border-2 border-black text-center">
                    <p className="text-xs font-black text-gray-600">
                      YOUR NFTS
                    </p>
                    <p className="text-lg font-black">8</p>
                  </div>
                </div>

                <Button className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  BROWSE MARKETPLACE
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-black text-white flex items-center justify-center border-2 border-border">
                    <PenTool className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">CREATE YOUR ART</h3>
                    <p className="text-sm text-gray-600 font-mono">
                      UNLEASH YOUR CREATIVITY
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="bg-gray-100 p-3 border-2 border-black">
                    <p className="text-sm font-black">DRAFTS: 2</p>
                  </div>
                  <div className="bg-gray-100 p-3 border-2 border-black">
                    <p className="text-sm font-black">SUBMITTED: 5</p>
                  </div>
                  <div className="bg-yellow-400 p-3 border-2 border-black">
                    <p className="text-sm font-black">WINNERS: 1 🏆</p>
                  </div>
                </div>

                <Button className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black">
                  <Upload className="w-4 h-4 mr-2" />
                  START CREATING
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
