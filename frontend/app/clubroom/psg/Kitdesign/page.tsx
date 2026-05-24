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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Trophy,
  Palette,
  Users,
  Coins,
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Upload,
  Eye,
  Star,
  Medal,
  Crown,
  PenTool,
  Gavel,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  Camera,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface KitSubmission {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  votes: number;
  userVote: "up" | "down" | null;
  submittedAt: string;
  views: number;
}

export default function KitDesignPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<KitSubmission[]>([
    {
      id: "1",
      title: "PSG Third Kit - Neon Dreams",
      imageUrl: "/kit-designs/neon-dreams.jpg",
      author: "DesignMaster_PSG",
      votes: 127,
      userVote: null,
      submittedAt: "2 hours ago",
      views: 342,
    },
    {
      id: "2",
      title: "Classic Blue Elegance",
      imageUrl: "/kit-designs/classic-blue.jpg",
      author: "RetroDesigner",
      votes: 89,
      userVote: "up",
      submittedAt: "5 hours ago",
      views: 256,
    },
    {
      id: "3",
      title: "Parisian Night Sky",
      imageUrl: "/kit-designs/night-sky.jpg",
      author: "ParisianArtist",
      votes: 156,
      userVote: null,
      submittedAt: "1 day ago",
      views: 478,
    },
    {
      id: "4",
      title: "Minimalist Approach",
      imageUrl: "/kit-designs/minimalist.jpg",
      author: "CleanDesigns",
      votes: 73,
      userVote: null,
      submittedAt: "1 day ago",
      views: 189,
    },
    {
      id: "5",
      title: "Retro Inspired Kit",
      imageUrl: "/kit-designs/retro.jpg",
      author: "VintageVibes",
      votes: 45,
      userVote: "down",
      submittedAt: "2 days ago",
      views: 134,
    },
    {
      id: "6",
      title: "Geometric Patterns",
      imageUrl: "/kit-designs/geometric.jpg",
      author: "ModernArt_PSG",
      votes: 92,
      userVote: null,
      submittedAt: "2 days ago",
      views: 203,
    },
    {
      id: "7",
      title: "Eiffel Tower Tribute",
      imageUrl: "/kit-designs/eiffel.jpg",
      author: "ParisLover",
      votes: 234,
      userVote: "up",
      submittedAt: "3 days ago",
      views: 567,
    },
    {
      id: "8",
      title: "Galaxy Theme",
      imageUrl: "/kit-designs/galaxy.jpg",
      author: "SpaceDesigner",
      votes: 67,
      userVote: null,
      submittedAt: "3 days ago",
      views: 145,
    },
  ]);

  const [sortBy, setSortBy] = useState<"votes" | "recent" | "views">("votes");

  const handleVote = (submissionId: string, voteType: "up" | "down") => {
    console.log(`Voting ${voteType} for submission ${submissionId}`);
    setSubmissions((prevSubmissions) =>
      prevSubmissions.map((submission) => {
        if (submission.id === submissionId) {
          let newVotes = submission.votes;
          let newUserVote: "up" | "down" | null = voteType;

          // Remove previous vote if exists
          if (submission.userVote === "up") {
            newVotes -= 1;
          } else if (submission.userVote === "down") {
            newVotes += 1;
          }

          // Apply new vote
          if (voteType === "up") {
            newVotes += 1;
          } else if (voteType === "down") {
            newVotes -= 1;
          }

          // If clicking the same vote type, remove the vote
          if (submission.userVote === voteType) {
            newUserVote = null;
            if (voteType === "up") {
              newVotes -= 1;
            } else {
              newVotes += 1;
            }
          }

          console.log(
            `Updated votes for ${submissionId}: ${newVotes}, userVote: ${newUserVote}`
          );
          return {
            ...submission,
            votes: newVotes,
            userVote: newUserVote,
          };
        }
        return submission;
      })
    );
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.votes - a.votes;
      case "recent":
        return submissions.indexOf(a) - submissions.indexOf(b);
      case "views":
        return b.views - a.views;
      default:
        return 0;
    }
  });

  const handleBack = () => {
    console.log("Navigating back to PSG club room");
    router.push("/clubroom/psg");
  };

  const handleCreateSubmission = () => {
    console.log("Create Submission button clicked");
    alert("Create Submission modal would open here");
  };

  const handleSortChange = (sortType: "votes" | "recent" | "views") => {
    console.log(`Setting sort to ${sortType}`);
    setSortBy(sortType);
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
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
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
                        className="bg-white text-black border-2 border-border hover:bg-gray-100 p-2 hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div className="bg-white px-3 py-1 border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-black font-black text-sm tracking-wider">
                          FANVAS
                        </span>
                      </div>
                      <span className="text-gray-400 font-mono text-sm">
                        / CLUB ROOMS / PSG / KIT DESIGN
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Menu Dropdowns */}
                      {menuItems.map((category, index) => (
                        <DropdownMenu key={index}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="noShadow"
                              className="bg-white text-black border-2 border-border hover:bg-gray-100 font-black text-sm hover:scale-105 active:scale-95 transition-all duration-200"
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

                      <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                        <Coins className="w-4 h-4" />
                        <span>125 TOKENS</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kit Design Contest Header */}
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 flex items-center justify-center">
                        <PenTool className="w-8 h-8 text-black" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-black tracking-wider mb-2">
                          PSG THIRD KIT DESIGN
                        </CardTitle>
                        <p className="text-sm font-mono opacity-80">
                          SUBMIT YOUR DESIGNS AND VOTE FOR THE BEST
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-green-400 text-black px-3 py-2 border-2 border-border font-black text-sm">
                        <Clock className="w-4 h-4 mr-2 inline" />
                        <span>5 DAYS LEFT</span>
                      </div>
                      <div className="bg-purple-400 text-black px-3 py-2 border-2 border-border font-black text-sm">
                        <Users className="w-4 h-4 mr-2 inline" />
                        <span>234 SUBMISSIONS</span>
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
                { label: "Total Submissions", value: "234", icon: Upload },
                { label: "Total Votes", value: "1,247", icon: Trophy },
                { label: "Your Votes", value: "12", icon: Star },
                { label: "Days Left", value: "5", icon: Clock },
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

          {/* Actions Bar */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleCreateSubmission}
                    className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 px-6 py-3"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Create Submission
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="neutral"
                      className={`border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 ${
                        sortBy === "votes"
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-gray-100 active:bg-gray-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                      onClick={() => handleSortChange("votes")}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Top Voted
                    </Button>

                    <Button
                      variant="neutral"
                      className={`border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 ${
                        sortBy === "recent"
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-gray-100 active:bg-gray-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                      onClick={() => handleSortChange("recent")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Recent
                    </Button>

                    <Button
                      variant="neutral"
                      className={`border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 ${
                        sortBy === "views"
                          ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-white text-black hover:bg-gray-100 active:bg-gray-200 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                      onClick={() => handleSortChange("views")}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Most Viewed
                    </Button>
                  </div>
                </div>

                <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-2 rounded-lg">
                  <span className="text-black font-black text-lg">
                    Prize: Custom 1/1 NFT + Bragging Rights
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Submissions Grid */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0">
              <CardHeader className="bg-black text-white p-6">
                <CardTitle className="text-2xl font-black tracking-wider flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  SUBMISSIONS
                </CardTitle>
                <p className="text-gray-300 font-mono text-sm">
                  VOTE FOR YOUR FAVORITE DESIGNS
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sortedSubmissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden hover:scale-[1.02] cursor-pointer">
                        <div className="flex">
                          {/* Vote Section */}
                          <div className="flex flex-col items-center justify-center bg-gray-100 border-r-4 border-black p-4 min-w-[80px]">
                            <Button
                              variant="noShadow"
                              size="sm"
                              className={`p-2 border-2 border-black transition-all duration-200 hover:scale-110 active:scale-95 ${
                                submission.userVote === "up"
                                  ? "bg-green-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                  : "text-gray-600 hover:bg-green-200 active:bg-green-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              }`}
                              onClick={() => handleVote(submission.id, "up")}
                            >
                              <ChevronUp className="w-6 h-6" />
                            </Button>

                            <span className="text-xl font-black text-black my-2 select-none">
                              {submission.votes}
                            </span>

                            <Button
                              variant="noShadow"
                              size="sm"
                              className={`p-2 border-2 border-black transition-all duration-200 hover:scale-110 active:scale-95 ${
                                submission.userVote === "down"
                                  ? "bg-red-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                  : "text-gray-600 hover:bg-red-200 active:bg-red-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                              }`}
                              onClick={() => handleVote(submission.id, "down")}
                            >
                              <ChevronDown className="w-6 h-6" />
                            </Button>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-black text-black mb-2">
                                  {submission.title}
                                </h3>
                                <div className="flex items-center gap-4 text-gray-600 text-sm font-bold">
                                  <span>by {submission.author}</span>
                                  <span>{submission.submittedAt}</span>
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    <span>{submission.views}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Ranking Badge */}
                              {sortBy === "votes" && index < 3 && (
                                <div className="flex items-center gap-1">
                                  {index === 0 && (
                                    <Crown className="w-6 h-6 text-yellow-500" />
                                  )}
                                  {index === 1 && (
                                    <Medal className="w-6 h-6 text-gray-400" />
                                  )}
                                  {index === 2 && (
                                    <Star className="w-6 h-6 text-orange-500" />
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Kit Design Image */}
                            <div className="bg-gray-100 border-4 border-black rounded-lg p-4 h-48 flex items-center justify-center">
                              <div className="text-gray-500 text-center">
                                <Upload className="w-12 h-12 mx-auto mb-2" />
                                <p className="font-bold">Kit Design Image</p>
                                <p className="text-sm">({submission.title})</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contest Guidelines */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <h2 className="text-2xl font-black text-black mb-4">
                Contest Guidelines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-black text-black mb-2">
                    Requirements
                  </h3>
                  <ul className="text-gray-700 font-bold space-y-1">
                    <li>• Design must be original</li>
                    <li>• Include PSG colors (Blue, Red, White)</li>
                    <li>• High resolution (minimum 1920x1080)</li>
                    <li>• Submit in PNG or JPG format</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-black text-black mb-2">
                    Judging Criteria
                  </h3>
                  <ul className="text-gray-700 font-bold space-y-1">
                    <li>• Community votes (70%)</li>
                    <li>• Originality (20%)</li>
                    <li>• Technical quality (10%)</li>
                    <li>• Winner announced in 5 days</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
