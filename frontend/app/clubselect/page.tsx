"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  X,
  Shield,
  Trophy,
  Lock,
  Unlock,
  Coins,
  ArrowLeft,
  Users,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useWallet } from "@/components/WalletProvider";

interface Club {
  id: string;
  name: string;
  shortName: string;
  color: string;
  tokensRequired: number;
  isAvailable: boolean;
  memberCount: number;
  description: string;
  logoPath: string;
}

export default function ClubSelect() {
  const router = useRouter();
  const { fanBalances, isConnected, isConnecting } = useWallet();

  const argBalance = isConnected ? parseFloat(fanBalances.ARG) || 0 : 0;
  const braBalance = isConnected ? parseFloat(fanBalances.BRA) || 0 : 0;
  const fraBalance = isConnected ? parseFloat(fanBalances.FRA) || 0 : 0;

  const clubs: Club[] = [
    {
      id: "ARG",
      name: "ARGENTINA",
      shortName: "ARG",
      color: "bg-sky-500",
      tokensRequired: 1,
      isAvailable: argBalance >= 1,
      memberCount: 41000,
      description: "Reigning World Cup champions",
      logoPath: "/logos/arg.jpg",
    },
    {
      id: "BRA",
      name: "BRAZIL",
      shortName: "BRA",
      color: "bg-yellow-400",
      tokensRequired: 1,
      isAvailable: braBalance >= 1,
      memberCount: 52000,
      description: "Five-time World Cup winners",
      logoPath: "/logos/bra.png",
    },
    {
      id: "FRA",
      name: "FRANCE",
      shortName: "FRA",
      color: "bg-blue-700",
      tokensRequired: 1,
      isAvailable: fraBalance >= 1,
      memberCount: 38000,
      description: "Les Bleus on the world stage",
      logoPath: "/logos/fra.webp",
    },
  ];

  const handleEnterClub = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId);
    if (club?.isAvailable) {
      router.push(`/clubroom/psg?team=${clubId}`);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

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
                      / WORLD CUP TEAMS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                    <Coins className="w-4 h-4" />
                    <span>TOKENS</span>
                    {!isConnected && !isConnecting && (
                      <span className="text-xs opacity-70">
                        (Connect Wallet)
                      </span>
                    )}
                    {isConnecting && (
                      <span className="text-xs opacity-70">
                        (Connecting...)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Header Content */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-wider mb-2">
                      PICK YOUR WORLD CUP TEAM
                    </CardTitle>
                    <p className="text-sm font-mono opacity-80">
                      ENTER YOUR WORLD CUP HQ
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {clubs.map((club) => (
                      <motion.div key={club.id} className="relative group" whileHover={{ scale: 1.1 }}>
                        <div className="flex items-center gap-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2">
                          <div className="w-5 h-5 flex items-center justify-center bg-gray-50 border border-black p-0.5">
                            <Image src={club.logoPath} alt={club.shortName} width={16} height={16} className="object-contain max-w-full max-h-full" />
                          </div>
                          <span className="text-sm font-black text-black min-w-[16px] text-center">
                            {isConnecting
                              ? "…"
                              : isConnected
                              ? parseFloat(fanBalances[club.id as 'ARG' | 'BRA' | 'FRA'] || "0").toFixed(1)
                              : "0"}
                          </span>
                        </div>
                        <motion.div
                          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-2 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-bold whitespace-nowrap z-50"
                          initial={{ opacity: 0, y: -10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {club.shortName} TOKENS:{" "}
                          {isConnecting ? "Connecting…" : isConnected
                            ? parseFloat(fanBalances[club.id as 'ARG' | 'BRA' | 'FRA'] || "0").toFixed(2)
                            : "Not Connected"}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black border-l border-t border-white rotate-45 translate-y-1"></div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Club Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {clubs.map((club, index) => (
            <motion.div
              key={club.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card
                className={`
                  shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] 
                  border-4 border-border 
                  cursor-pointer 
                  transition-all duration-300 
                  ${
                    club.isAvailable
                      ? "hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:scale-105"
                      : "opacity-60"
                  }
                `}
                onClick={() => handleEnterClub(club.id)}
              >
                <CardContent className="p-4 text-center space-y-4">
                  {/* Large Logo with Shine Effect */}
                  <div className="flex justify-center">
                    <motion.div
                      className="relative w-48 h-48 bg-white border-4 border-black flex items-center justify-center p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={club.logoPath}
                        alt={`${club.name} logo`}
                        width={160}
                        height={160}
                        className="object-contain max-w-full max-h-full z-10 relative"
                      />

                      {/* Glossy Base Layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5" />

                      {/* Main Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: "-100%", rotate: 25 }}
                        whileHover={{
                          x: "100%",
                          transition: {
                            duration: 0.8,
                            ease: "easeInOut",
                          },
                        }}
                        style={{
                          width: "150%",
                          height: "150%",
                          top: "-25%",
                          left: "-25%",
                        }}
                      />

                      {/* Secondary Shine */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      />

                      {/* Hover Glow */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  </div>

                  {/* Club Name */}
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      {club.shortName}
                    </h3>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    {club.isAvailable ? (
                      <motion.div
                        className="bg-main text-black px-3 py-2 border-3 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black text-sm"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Unlock className="w-3 h-3 inline mr-1" />
                        ENTER ROOM
                      </motion.div>
                    ) : (
                      <div className="bg-red-500 text-white px-3 py-2 border-3 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black text-sm">
                        <Lock className="w-3 h-3 inline mr-1" />
                        NEED {club.shortName} TOKEN
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Simple FANVAS Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs font-bold text-gray-600">
            POWERED BY FANVAS · ON X LAYER
          </p>
        </motion.div>
      </div>
    </div>
  );
}
