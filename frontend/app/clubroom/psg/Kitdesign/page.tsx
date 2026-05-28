"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePools, Pool } from "@/hooks/database/usePools";
import { useSubmissions, Submission } from "@/hooks/database/useSubmissions";
import { useVote } from "@/hooks/contracts/useVote";
import { useVoteCounts } from "@/hooks/database/useVoteCounts";
import { useWallet } from "@/components/WalletProvider";

// Using Submission interface from useSubmissions hook

export default function KitDesignPage() {
  const router = useRouter();
  const { pools, isLoading, error, getPoolsByType } = usePools();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const {
    submissions,
    isLoading: submissionsLoading,
    error: submissionsError,
    refreshSubmissions,
    getGatewayUrl,
  } = useSubmissions(selectedPool?.id);

  const [sortBy, setSortBy] = useState<"votes" | "recent" | "views">("votes");

  // Wallet connection
  const { isConnected, userAddress } = useWallet();

  // Voting hooks
  const {
    isVoting,
    error: voteError,
    success: voteSuccess,
    txHash,
    vote,
    resetSuccess,
    userPsgBalance,
  } = useVote();

  const {
    voteCounts,
    isLoading: voteCountsLoading,
    error: voteCountsError,
    getVoteCount,
    hasUserVoted,
    hasUserVotedInPool,
    refreshVoteCounts,
  } = useVoteCounts(selectedPool?.id);

  // State to track voting status for each submission
  const [votingSubmission, setVotingSubmission] = useState<number | null>(null);
  const [userVotedInPool, setUserVotedInPool] = useState<boolean>(false);
  const [submissionVoteStatus, setSubmissionVoteStatus] = useState<
    Record<number, boolean>
  >({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Ref to prevent multiple simultaneous refresh operations
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef<boolean>(false);

  // Get jersey pools
  const jerseyPools = getPoolsByType("JERSEY");

  // Set default selected pool when pools are loaded
  useEffect(() => {
    if (jerseyPools.length > 0 && !selectedPool) {
      setSelectedPool(jerseyPools[0]);
    }
  }, [jerseyPools, selectedPool]);

  // Check if user has voted in the current pool
  useEffect(() => {
    const checkUserVotedInPool = async () => {
      if (selectedPool && userAddress && isConnected) {
        try {
          // Add a small delay to prevent rapid-fire requests
          await new Promise((resolve) => setTimeout(resolve, 150));
          const hasVoted = await hasUserVotedInPool(
            selectedPool.id,
            userAddress
          );
          setUserVotedInPool(hasVoted);
        } catch (error) {
          console.error("Error checking user vote in pool:", error);
          setUserVotedInPool(false);
        }
      } else {
        setUserVotedInPool(false);
      }
    };

    // Debounce the check to prevent rapid calls
    const timeoutId = setTimeout(() => {
      checkUserVotedInPool();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedPool?.id, userAddress, isConnected]); // Remove hasUserVotedInPool from dependencies

  // Check voting status for each submission
  useEffect(() => {
    const checkSubmissionVoteStatus = async () => {
      if (submissions.length > 0 && userAddress && isConnected) {
        try {
          const statusMap: Record<number, boolean> = {};

          // Add a small delay to prevent rapid-fire requests
          await new Promise((resolve) => setTimeout(resolve, 100));

          for (const submission of submissions) {
            const hasVoted = await hasUserVoted(submission.id, userAddress);
            statusMap[submission.id] = hasVoted;
            // Small delay between requests to prevent overwhelming the server
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          setSubmissionVoteStatus(statusMap);
        } catch (error) {
          console.error("Error checking submission vote status:", error);
          setSubmissionVoteStatus({});
        }
      } else {
        setSubmissionVoteStatus({});
      }
    };

    // Debounce the check to prevent rapid calls
    const timeoutId = setTimeout(() => {
      if (submissions.length > 0 && userAddress && isConnected) {
        checkSubmissionVoteStatus();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [submissions.length, userAddress, isConnected]); // Remove hasUserVoted and use submissions.length instead

  // Handle successful voting
  useEffect(() => {
    if (voteSuccess && !isRefreshingRef.current) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      const handleSuccessfulVote = async () => {
        try {
          console.log("Refreshing data after successful vote...");

          // Refresh submissions to get updated vote counts
          await refreshSubmissions();
          // Refresh vote counts
          await refreshVoteCounts();
          // Reset voting state
          setVotingSubmission(null);
          // Re-check user voting status
          if (selectedPool && userAddress && isConnected) {
            const hasVoted = await hasUserVotedInPool(
              selectedPool.id,
              userAddress
            );
            setUserVotedInPool(hasVoted);
          }
        } catch (error) {
          console.error("Error refreshing after vote:", error);
        } finally {
          setIsRefreshing(false);
          isRefreshingRef.current = false;
          // Reset the success state to prevent infinite loops
          resetSuccess();
        }
      };

      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      // Add a delay to allow blockchain state to settle
      refreshTimeoutRef.current = setTimeout(handleSuccessfulVote, 1000);
    }
  }, [
    voteSuccess,
    selectedPool?.id,
    userAddress,
    isConnected,
    refreshSubmissions,
    refreshVoteCounts,
    hasUserVotedInPool,
    resetSuccess,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handlePoolSelect = (poolId: string) => {
    const pool = jerseyPools.find((p) => p.id.toString() === poolId);
    if (pool) {
      setSelectedPool(pool);
    }
  };

  // Helper function to get pool phase
  const getPoolPhase = (pool: Pool) => {
    const now = Date.now();
    const submissionDeadline = pool.submission_deadline * 1000;
    const votingDeadline = pool.voting_deadline * 1000;

    if (!pool.active) return { phase: "INACTIVE", color: "bg-gray-400" };
    if (now < submissionDeadline)
      return { phase: "SUBMISSION", color: "bg-green-400" };
    if (now < votingDeadline) return { phase: "VOTING", color: "bg-blue-400" };
    return { phase: "ENDED", color: "bg-red-400" };
  };

  // Handle voting
  const handleVote = async (
    submission: Submission,
    voteType: "up" | "down"
  ) => {
    // Only allow upvoting for now (as per smart contract)
    if (voteType === "down") {
      console.log("Downvoting not supported by smart contract");
      return;
    }

    // Check if user is connected
    if (!isConnected || !userAddress) {
      console.log("Please connect your wallet to vote");
      return;
    }

    // Check if pool is selected
    if (!selectedPool) {
      console.log("No pool selected");
      return;
    }

    // Check if user has already voted in this pool
    if (userVotedInPool) {
      console.log("You have already voted in this pool");
      return;
    }

    // Check if user has enough Fan tokens
    if (parseFloat(userPsgBalance) < 10) {
      console.log(
        `You need at least 10 Fan tokens to vote. Current balance: ${userPsgBalance}`
      );
      return;
    }

    // Check if submission has contract_submission_id
    if (
      submission.contract_submission_id === null ||
      submission.contract_submission_id === undefined
    ) {
      console.log("This submission doesn't have a contract submission ID");
      return;
    }

    // Check if voting is currently allowed (after submission deadline, before voting deadline)
    const now = Date.now();
    const submissionDeadline = selectedPool.submission_deadline * 1000;
    const votingDeadline = selectedPool.voting_deadline * 1000;

    if (now < submissionDeadline) {
      console.log("Voting period hasn't started yet");
      return;
    }

    if (now > votingDeadline) {
      console.log("Voting period has ended");
      return;
    }

    try {
      setVotingSubmission(submission.id);

      // Call the vote function with poolId and contractSubmissionId
      await vote(selectedPool.id, submission.contract_submission_id);

      console.log(`Successfully voted for submission ${submission.id}`);
    } catch (error) {
      console.error("Error voting:", error);
      setVotingSubmission(null);
    }
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.vote_count - a.vote_count;
      case "recent":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "views":
        // Views not available in database, fallback to vote_count
        return b.vote_count - a.vote_count;
      default:
        return 0;
    }
  });

  const handleBack = () => {
    console.log("Navigating back to Fan club room");
    router.push("/clubroom/psg");
  };

  const handleCreateSubmission = () => {
    console.log("Create Submission button clicked");
    router.push("/clubroom/psg/Kitdesign/editor");
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
          {/* Loading State */}
          {(isLoading || submissionsLoading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xl font-black text-black">
                    LOADING POOLS...
                  </span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Error State */}
          {(error || submissionsError) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center min-h-[400px]"
            >
              <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                <div className="text-center">
                  <div className="text-red-500 text-4xl font-black mb-4">
                    ERROR
                  </div>
                  <p className="text-black font-bold">
                    {error || submissionsError}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-black text-white font-black border-2 border-border"
                  >
                    RETRY
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          {!isLoading && !submissionsLoading && !error && !submissionsError && (
            <>
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
                            / WORLD CUP TEAMS / KIT DESIGN
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
                            <span>{userPsgBalance} Fan</span>
                          </div>
                          {isConnected && (
                            <div
                              className={`flex items-center gap-2 px-3 py-2 border-2 border-border font-black text-sm ${
                                userVotedInPool ? "bg-green-400" : "bg-blue-400"
                              } text-black`}
                            >
                              <Trophy className="w-4 h-4" />
                              <span>
                                {userVotedInPool ? "VOTED" : "CAN VOTE"}
                              </span>
                            </div>
                          )}
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
                              {selectedPool
                                ? `${selectedPool.match_id} - WORLD CUP KIT`
                                : "WORLD CUP KIT DESIGN"}
                            </CardTitle>
                            <p className="text-sm font-mono opacity-80">
                              SUBMIT YOUR WORLD CUP DESIGNS · COMMUNITY VOTES WIN
                            </p>
                            {selectedPool && (
                              <p className="text-xs font-mono opacity-60 mt-1">
                                Pool ID: {selectedPool.id} |{" "}
                                {getPoolPhase(selectedPool).phase}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`text-black px-3 py-2 border-2 border-border font-black text-sm ${
                              selectedPool &&
                              selectedPool.submission_deadline * 1000 >
                                Date.now()
                                ? "bg-green-400"
                                : "bg-orange-400"
                            }`}
                          >
                            <Clock className="w-4 h-4 mr-2 inline" />
                            <span>
                              {selectedPool &&
                              selectedPool.submission_deadline * 1000 >
                                Date.now()
                                ? `SUB: ${Math.ceil(
                                    (selectedPool.submission_deadline * 1000 -
                                      Date.now()) /
                                      (1000 * 60 * 60 * 24)
                                  )} DAYS`
                                : "SUBMISSION CLOSED"}
                            </span>
                          </div>
                          <div
                            className={`text-black px-3 py-2 border-2 border-border font-black text-sm ${
                              selectedPool &&
                              selectedPool.voting_deadline * 1000 > Date.now()
                                ? "bg-blue-400"
                                : "bg-red-400"
                            }`}
                          >
                            <Trophy className="w-4 h-4 mr-2 inline" />
                            <span>
                              {selectedPool &&
                              selectedPool.voting_deadline * 1000 > Date.now()
                                ? `VOTE: ${Math.ceil(
                                    (selectedPool.voting_deadline * 1000 -
                                      Date.now()) /
                                      (1000 * 60 * 60 * 24)
                                  )} DAYS`
                                : "VOTING CLOSED"}
                            </span>
                          </div>
                          <div className="bg-purple-400 text-black px-3 py-2 border-2 border-border font-black text-sm">
                            <Users className="w-4 h-4 mr-2 inline" />
                            <span>
                              {submissionsLoading ? "..." : submissions.length}{" "}
                              SUBMISSIONS
                            </span>
                          </div>
                          {selectedPool && (
                            <div
                              className={`text-black px-3 py-2 border-2 border-border font-black text-sm ${
                                selectedPool.active
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            >
                              <span>
                                {selectedPool.active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              {/* Voting Status Messages */}
              {(voteError || voteSuccess) && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="mb-8"
                >
                  <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
                    {voteError && (
                      <div className="flex items-center gap-3 text-red-500 font-black">
                        <div className="w-6 h-6 bg-red-500 border-2 border-black flex items-center justify-center">
                          <span className="text-white text-sm">!</span>
                        </div>
                        <span>VOTING ERROR: {voteError}</span>
                      </div>
                    )}
                    {voteSuccess && (
                      <div className="flex items-center gap-3 text-green-500 font-black">
                        <div className="w-6 h-6 bg-green-500 border-2 border-black flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span>VOTING SUCCESS: {voteSuccess}</span>
                        {txHash && (
                          <span className="text-blue-500 text-sm">
                            TX: {txHash.slice(0, 10)}...
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Stats Overview */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Submissions",
                      value: submissionsLoading
                        ? "..."
                        : submissions.length.toString(),
                      icon: Upload,
                    },
                    {
                      label: "Total Votes",
                      value: submissionsLoading
                        ? "..."
                        : submissions
                            .reduce((sum, s) => sum + s.vote_count, 0)
                            .toString(),
                      icon: Trophy,
                    },
                    {
                      label: "Submission Phase",
                      value: selectedPool
                        ? selectedPool.submission_deadline * 1000 > Date.now()
                          ? "OPEN"
                          : "CLOSED"
                        : "OPEN",
                      icon: Clock,
                    },
                    {
                      label: "Days to Vote End",
                      value: selectedPool
                        ? Math.max(
                            0,
                            Math.ceil(
                              (selectedPool.voting_deadline * 1000 -
                                Date.now()) /
                                (1000 * 60 * 60 * 24)
                            )
                          ).toString()
                        : "5",
                      icon: Star,
                    },
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

              {/* Pool Information */}
              {selectedPool && (
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-8"
                >
                  <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            getPoolPhase(selectedPool).color
                          }`}
                        ></div>
                        <div>
                          <h3 className="text-xl font-black text-black">
                            Pool Information
                          </h3>
                          <p className="text-sm font-mono text-gray-600">
                            Selected: {selectedPool.match_id}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 border-2 border-black ${
                          getPoolPhase(selectedPool).color
                        } font-black text-sm`}
                      >
                        {getPoolPhase(selectedPool).phase}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      <div className="bg-gray-50 p-4 border-2 border-black">
                        <h4 className="font-black text-black text-sm mb-2">
                          POOL DETAILS
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-bold">ID:</span>{" "}
                            {selectedPool.id}
                          </p>
                          <p>
                            <span className="font-bold">Type:</span>{" "}
                            {selectedPool.pool_type}
                          </p>
                          <p>
                            <span className="font-bold">Status:</span>{" "}
                            {selectedPool.active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 border-2 border-black">
                        <h4 className="font-black text-black text-sm mb-2">
                          CREATED
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-bold">
                            {new Date(
                              selectedPool.created_at
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            {new Date(
                              selectedPool.created_at
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 border-2 border-black">
                        <h4 className="font-black text-black text-sm mb-2">
                          SUBMISSION DEADLINE
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-bold">
                            {new Date(
                              selectedPool.submission_deadline * 1000
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            {new Date(
                              selectedPool.submission_deadline * 1000
                            ).toLocaleTimeString()}
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              selectedPool.submission_deadline * 1000 >
                              Date.now()
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedPool.submission_deadline * 1000 >
                            Date.now()
                              ? `${Math.ceil(
                                  (selectedPool.submission_deadline * 1000 -
                                    Date.now()) /
                                    (1000 * 60 * 60 * 24)
                                )} days left`
                              : "Expired"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 border-2 border-black">
                        <h4 className="font-black text-black text-sm mb-2">
                          VOTING DEADLINE
                        </h4>
                        <div className="space-y-1 text-sm">
                          <p className="font-bold">
                            {new Date(
                              selectedPool.voting_deadline * 1000
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            {new Date(
                              selectedPool.voting_deadline * 1000
                            ).toLocaleTimeString()}
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              selectedPool.voting_deadline * 1000 > Date.now()
                                ? "text-blue-600"
                                : "text-red-600"
                            }`}
                          >
                            {selectedPool.voting_deadline * 1000 > Date.now()
                              ? `${Math.ceil(
                                  (selectedPool.voting_deadline * 1000 -
                                    Date.now()) /
                                    (1000 * 60 * 60 * 24)
                                )} days left`
                              : "Expired"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Actions Bar */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8"
              >
                <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">

                    {/* Left: Create Submission */}
                    <Button
                      onClick={handleCreateSubmission}
                      className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-black text-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 px-6 py-3"
                    >
                      <Plus className="w-6 h-6 mr-2" />
                      Create Submission
                    </Button>

                    {/* Right: Sort buttons + Pool selector */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="neutral"
                        className={`border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:scale-105 active:scale-95 ${
                          sortBy === "votes"
                            ? "bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-white text-black hover:bg-gray-100 active:bg-gray-200"
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
                            : "bg-white text-black hover:bg-gray-100 active:bg-gray-200"
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
                            : "bg-white text-black hover:bg-gray-100 active:bg-gray-200"
                        }`}
                        onClick={() => handleSortChange("views")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Most Viewed
                      </Button>

                      <Select
                        onValueChange={handlePoolSelect}
                        value={selectedPool?.id.toString()}
                      >
                        <SelectTrigger className="w-[260px] bg-white text-black border-4 border-black font-black text-sm hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <SelectValue placeholder="Select Pool" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                          <SelectGroup>
                            <SelectLabel className="font-black text-black">
                              World Cup Pools
                            </SelectLabel>
                            {isLoading ? (
                              <SelectItem value="loading" disabled>Loading pools...</SelectItem>
                            ) : error ? (
                              <SelectItem value="error" disabled>Error loading pools</SelectItem>
                            ) : jerseyPools.length === 0 ? (
                              <SelectItem value="empty" disabled>No jersey pools available</SelectItem>
                            ) : (
                              jerseyPools.map((pool) => (
                                <SelectItem
                                  key={pool.id}
                                  value={pool.id.toString()}
                                  className="font-bold text-black hover:bg-gray-100"
                                >
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span className="truncate">{pool.match_id}</span>
                                    <span className={`text-xs px-2 py-0.5 shrink-0 ${getPoolPhase(pool).color} text-black font-black`}>
                                      {getPoolPhase(pool).phase}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                      VOTE FOR YOUR FAVORITE WORLD CUP DESIGNS
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
                                {/* Vote Up Button */}
                                <Button
                                  variant="noShadow"
                                  size="sm"
                                  disabled={
                                    !isConnected ||
                                    userVotedInPool ||
                                    isVoting ||
                                    votingSubmission === submission.id ||
                                    !selectedPool ||
                                    Date.now() <
                                      selectedPool.submission_deadline * 1000 ||
                                    Date.now() >
                                      selectedPool.voting_deadline * 1000 ||
                                    parseFloat(userPsgBalance) < 10
                                  }
                                  className={`p-2 border-2 border-black transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                                    userVotedInPool ||
                                    submissionVoteStatus[submission.id]
                                      ? "bg-green-300 text-green-800"
                                      : "text-gray-600 hover:bg-green-200 active:bg-green-300"
                                  } hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                                  onClick={() => handleVote(submission, "up")}
                                >
                                  {votingSubmission === submission.id ? (
                                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <ChevronUp className="w-6 h-6" />
                                  )}
                                </Button>

                                {/* Vote Count */}
                                <span className="text-xl font-black text-black my-2 select-none">
                                  {submission.vote_count}
                                </span>

                                {/* Vote Down Button (Disabled - not supported by contract) */}
                                <Button
                                  variant="noShadow"
                                  size="sm"
                                  disabled={true}
                                  className="p-2 border-2 border-black transition-all duration-200 opacity-30 cursor-not-allowed bg-gray-300 text-gray-500"
                                  title="Downvoting not supported"
                                >
                                  <ChevronDown className="w-6 h-6" />
                                </Button>

                                {/* Voting Status Indicators */}
                                {!isConnected && (
                                  <div className="text-xs text-red-500 font-bold mt-1 text-center">
                                    Connect Wallet
                                  </div>
                                )}
                                {isConnected &&
                                  parseFloat(userPsgBalance) < 10 && (
                                    <div className="text-xs text-orange-500 font-bold mt-1 text-center">
                                      Need 10 Fan
                                    </div>
                                  )}
                                {isConnected && userVotedInPool && (
                                  <div className="text-xs text-green-500 font-bold mt-1 text-center">
                                    Already Voted
                                  </div>
                                )}
                                {selectedPool &&
                                  Date.now() <
                                    selectedPool.submission_deadline * 1000 && (
                                    <div className="text-xs text-blue-500 font-bold mt-1 text-center">
                                      Voting Soon
                                    </div>
                                  )}
                                {selectedPool &&
                                  Date.now() >
                                    selectedPool.voting_deadline * 1000 && (
                                    <div className="text-xs text-red-500 font-bold mt-1 text-center">
                                      Voting Ended
                                    </div>
                                  )}
                              </div>

                              {/* Content Section */}
                              <div className="flex-1 p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-black text-black mb-2">
                                      Submission #{submission.id}
                                    </h3>
                                    <div className="flex items-center gap-4 text-gray-600 text-sm font-bold">
                                      <span>
                                        by{" "}
                                        {submission.creator_address.slice(0, 6)}
                                        ...
                                        {submission.creator_address.slice(-4)}
                                      </span>
                                      <span>
                                        {new Date(
                                          submission.created_at
                                        ).toLocaleDateString()}
                                      </span>
                                      <div className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        <span>
                                          {submission.vote_count} votes
                                        </span>
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
                                <div
                                  className="bg-gray-100 border-4 border-black rounded-lg overflow-hidden relative"
                                  style={{ width: "400px", height: "250px" }}
                                >
                                  {submission.content_url ? (
                                    <>
                                      <img
                                        src={getGatewayUrl(
                                          submission.content_url
                                        )}
                                        alt={`Submission #${submission.id}`}
                                        className="w-full h-full object-cover object-top"
                                        onLoad={() => {
                                          console.log(
                                            "Image loaded successfully:",
                                            submission.content_url
                                          );
                                        }}
                                        onError={(e) => {
                                          console.log(
                                            "Image failed to load:",
                                            submission.content_url
                                          );
                                          const target =
                                            e.target as HTMLImageElement;
                                          target.style.display = "none";
                                          const fallback =
                                            target.parentElement?.querySelector(
                                              ".image-fallback"
                                            ) as HTMLElement;
                                          if (fallback) {
                                            fallback.style.display = "flex";
                                          }
                                        }}
                                      />
                                      <div
                                        className="image-fallback absolute inset-0 flex items-center justify-center text-gray-500 text-center"
                                        style={{ display: "none" }}
                                      >
                                        <div>
                                          <Upload className="w-12 h-12 mx-auto mb-2" />
                                          <p className="font-bold">
                                            Failed to Load Image
                                          </p>
                                          <p className="text-xs">
                                            URL:{" "}
                                            {submission.content_url.slice(
                                              0,
                                              30
                                            )}
                                            ...
                                          </p>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 text-center">
                                      <div>
                                        <Upload className="w-12 h-12 mx-auto mb-2" />
                                        <p className="font-bold">
                                          No Image Available
                                        </p>
                                        <p className="text-sm">
                                          (Submission #{submission.id})
                                        </p>
                                        <p className="text-xs text-red-500">
                                          content_url:{" "}
                                          {submission.content_url || "null"}
                                        </p>
                                      </div>
                                    </div>
                                  )}
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
                    World Cup Design Guidelines
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-black text-black mb-2">
                        Requirements
                      </h3>
                      <ul className="text-gray-700 font-bold space-y-1">
                        <li>• Design must be original</li>
                        <li>• Include your nation's colors</li>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
