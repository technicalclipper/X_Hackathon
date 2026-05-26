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
import GLBViewer from "@/components/3d/GLBViewer";

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const fanVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const contests: Contest[] = [
    {
      id: "1",
      title: "PSG Third Kit Design",
      description: "Design the next PSG third kit",
      reward: "Custom 1/1 NFT + Bragging Rights",

      deadline: "5 days",
      participants: 234,
      type: "Design",
      icon: PenTool,
    },
    {
      id: "2",
      title: "Parc des Princes Tifo",
      description: "Create a tifo for the next home match",
      reward: "Custom 1/1 NFT + Bragging Rights",

      deadline: "12 days",
      participants: 89,
      type: "Art",
      icon: Palette,
    },
    {
      id: "3",
      title: "Match Day Poster & Tickets",
      description: "Design poster & Tickets",
      reward: "Custom 1/1 NFT + Bragging Rights",
      deadline: "3 days",
      participants: 156,
      type: "Poster",
      icon: FileText,
    },
    {
      id: "4",
      title: "Fan Footage Contest",
      description: "Best fan video from last match",
      reward: "Custom 1/1 NFT + Bragging Rights",

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

  // Different 3D model configurations for each contest
  const modelConfigs = [
    {
      // Third Kit Design - Focus on the kit details
      cameraPosition: [-1.2, 1.8, 3.2] as [number, number, number],
      cameraTarget: [0, 1.2, 0] as [number, number, number],
      cameraFOV: 30,
      scale: 1.2,
      modelOffset: [0, 0, 0] as [number, number, number],
      ambientIntensity: 1.8,
      directionalIntensity: 2.2,
      directionalPosition: [5, 8, 5] as [number, number, number],
    },
    {
      // Tifo Contest - Wide angle for stadium view
      cameraPosition: [-2.0, 2.5, 4.0] as [number, number, number],
      cameraTarget: [0, 1.5, 0] as [number, number, number],
      cameraFOV: 65,
      scale: 0.9,
      modelOffset: [0, -0.2, 0] as [number, number, number],
      ambientIntensity: 2.2,
      directionalIntensity: 1.8,
      directionalPosition: [8, 10, 8] as [number, number, number],
    },
    {
      // Match Day Poster - Dynamic action angle
      cameraPosition: [-0.5, 1.2, 2.8] as [number, number, number],
      cameraTarget: [0, 1.0, 0] as [number, number, number],
      cameraFOV: 50,
      scale: 1.1,
      modelOffset: [0.2, 0, 0] as [number, number, number],
      ambientIntensity: 1.5,
      directionalIntensity: 2.5,
      directionalPosition: [3, 6, 4] as [number, number, number],
    },
    {
      // Fan Footage - Close-up dramatic angle
      cameraPosition: [-0.8, 1.0, 2.2] as [number, number, number],
      cameraTarget: [0, 0.8, 0] as [number, number, number],
      cameraFOV: 40,
      scale: 1.3,
      modelOffset: [-0.1, 0.1, 0] as [number, number, number],
      ambientIntensity: 1.2,
      directionalIntensity: 2.8,
      directionalPosition: [2, 4, 3] as [number, number, number],
    },
  ];

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: "url('/psg_bg.jpg')",
          backgroundSize: "cover", // Fill entire background area
          backgroundPosition: "center center",
          transform: `translateY(${scrollY * 0.5}px)`, // Parallax effect - moves slower than content
          willChange: "transform", // Optimize for animations
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
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
                                  <span className="font-black">
                                    {item.label}
                                  </span>
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
            <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0">
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
                  {contests.map((contest, index) => {
                    const config = modelConfigs[index] || modelConfigs[0]; // Fallback to first config
                    return (
                      <motion.div
                        key={contest.id}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => {
                          setHoveredCard(contest.id);
                          // Pause video for tifo contest (index 1) when hovered
                          if (index === 1 && videoRef.current) {
                            videoRef.current.pause();
                          }
                          // Pause video for fan footage contest (index 3) when hovered
                          if (index === 3 && fanVideoRef.current) {
                            fanVideoRef.current.pause();
                          }
                        }}
                        onHoverEnd={() => {
                          setHoveredCard(null);
                          // Resume video for tifo contest (index 1) when hover ends
                          if (index === 1 && videoRef.current) {
                            videoRef.current.play();
                          }
                          // Resume video for fan footage contest (index 3) when hover ends
                          if (index === 3 && fanVideoRef.current) {
                            fanVideoRef.current.play();
                          }
                        }}
                        className="p-4 bg-gray-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex gap-4">
                          {/* 3D Model, Video, or Image on the left */}
                          <div className="flex-shrink-0 w-fit">
                            {index === 1 ? (
                              // Video for Tifo contest
                              <video
                                ref={videoRef}
                                className="w-[200px] h-[300px] border-2 border-black object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                              >
                                <source
                                  src="/psg_tifo.webm"
                                  type="video/webm"
                                />
                                Your browser does not support the video tag.
                              </video>
                            ) : index === 2 ? (
                              // Image for Match Day Poster contest
                              <Image
                                src="/psg_poster.jpg"
                                alt="PSG Match Day Poster"
                                width={200}
                                height={300}
                                className="w-[200px] h-[300px] border-2 border-black object-cover"
                              />
                            ) : index === 3 ? (
                              // Video for Fan Footage contest
                              <video
                                ref={fanVideoRef}
                                className="w-[200px] h-[300px] border-2 border-black object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                              >
                                <source
                                  src="/psg_moment.webm"
                                  type="video/webm"
                                />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              // 3D Model for other contests
                              <GLBViewer
                                url="/psg.glb"
                                className="w-[200px] h-[300px] border-2 border-black"
                                scale={config.scale}
                                position={[0, 0, 0]}
                                autoRotate={hoveredCard !== contest.id}
                                // Camera controls (matching debug metric terminology)
                                cameraPosition={config.cameraPosition}
                                cameraRotation={[0, 0, 0]} // Camera rotation in degrees [x, y, z]
                                cameraDistance={undefined} // Let camera position control the view
                                cameraFOV={config.cameraFOV}
                                cameraTarget={config.cameraTarget}
                                // Lighting controls with positions
                                ambientIntensity={config.ambientIntensity}
                                directionalIntensity={
                                  config.directionalIntensity
                                }
                                directionalPosition={config.directionalPosition}
                                pointIntensity={1}
                                pointPosition={[-5, -5, -5]} // Point light position
                                // Model controls
                                modelOffset={config.modelOffset}
                                // Debug overlay
                                showDebug={false}
                                // Debug control examples - customize which metrics to show
                                showCameraMetrics={false}
                                showCameraPosition={false}
                                showCameraRotation={false}
                                showCameraDistance={false}
                                showCameraFOV={false}
                                showCameraTarget={false}
                                showLightingMetrics={false}
                                showAmbientLight={false}
                                showDirectionalLight={false}
                                showDirectionalPosition={false}
                                showPointLight={false}
                                showPointPosition={false}
                                showModelMetrics={false}
                                showModelOffset={false}
                                showPerformanceMetrics={false}
                                showFPS={false}
                              />
                            )}
                          </div>

                          {/* Content wrapping around the model */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-border">
                                  <contest.icon className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-black text-lg">
                                    {contest.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {contest.description}
                                  </p>
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

                              <div className="flex items-center justify-between mb-4">
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
                            </div>

                            <Button
                              className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                              onClick={() =>
                                contest.id === "1" &&
                                router.push("/clubroom/psg/Kitdesign")
                              }
                            >
                              JOIN CONTEST
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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

                  <Button
                    className="w-full bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black"
                    onClick={() => router.push("/marketplace")}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    BROWSE MARKETPLACE
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Create Section */}
          </div>
        </div>
      </div>
    </div>
  );
}
