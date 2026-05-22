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
  const [userTokens] = useState({
    psg: 1,
    fcb: 0,
    juve: 0,
    acm: 0,
    atm: 0,
    ars: 0,
  }); // User's club-specific tokens

  const clubs: Club[] = [
    {
      id: "psg",
      name: "PARIS SAINT-GERMAIN",
      shortName: "PSG",
      color: "bg-blue-800",
      tokensRequired: 1,
      isAvailable: userTokens.psg >= 1,
      memberCount: 15420,
      description: "The Parisian powerhouse with global superstars",
      logoPath: "/logos/psg.png",
    },
    {
      id: "barcelona",
      name: "FC BARCELONA",
      shortName: "FCB",
      color: "bg-blue-600",
      tokensRequired: 1,
      isAvailable: userTokens.fcb >= 1,
      memberCount: 28350,
      description: "More than a club - Mes que un club",
      logoPath: "/logos/fcb.png",
    },
    {
      id: "juventus",
      name: "JUVENTUS FC",
      shortName: "JUVE",
      color: "bg-gray-800",
      tokensRequired: 1,
      isAvailable: userTokens.juve >= 1,
      memberCount: 19875,
      description: "The Old Lady of Italian football",
      logoPath: "/logos/jfc.png",
    },
    {
      id: "milan",
      name: "AC MILAN",
      shortName: "ACM",
      color: "bg-red-600",
      tokensRequired: 1,
      isAvailable: userTokens.acm >= 1,
      memberCount: 22100,
      description: "Rossoneri - 7-time Champions League winners",
      logoPath: "/logos/acm.png",
    },
    {
      id: "atletico",
      name: "ATLETICO MADRID",
      shortName: "ATM",
      color: "bg-red-700",
      tokensRequired: 1,
      isAvailable: userTokens.atm >= 1,
      memberCount: 18650,
      description: "Aupa Atleti - The heart of Madrid",
      logoPath: "/logos/atm.png",
    },
    {
      id: "arsenal",
      name: "ARSENAL FC",
      shortName: "ARS",
      color: "bg-red-500",
      tokensRequired: 1,
      isAvailable: userTokens.ars >= 1,
      memberCount: 31200,
      description: "The Gunners - North London's finest",
      logoPath: "/logos/ars.png",
    },
  ];

  const handleEnterClub = (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId);
    if (club?.isAvailable) {
      // Navigate to PSG club room directly
      router.push(`/clubroom/psg`);
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
                      / CLUB ROOMS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-main text-black px-3 py-2 border-2 border-border font-black text-sm">
                    <Coins className="w-4 h-4" />
                    <span>TOKENS</span>
                  </div>
                </div>
              </div>

              {/* Main Header Content */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-black tracking-wider mb-2">
                      GO TO CLUB ROOM
                    </CardTitle>
                    <p className="text-sm font-mono opacity-80">
                      ENTER YOUR FOOTBALL SANCTUARY
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {clubs.slice(0, 4).map((club) => (
                      <motion.div
                        key={club.id}
                        className="relative group"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="flex items-center gap-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2">
                          <div className="w-5 h-5 flex items-center justify-center bg-gray-50 border border-black p-0.5">
                            <Image
                              src={club.logoPath}
                              alt={club.shortName}
                              width={16}
                              height={16}
                              className="object-contain max-w-full max-h-full"
                            />
                          </div>
                          <span className="text-sm font-black text-black min-w-[16px] text-center">
                            {userTokens[club.id as keyof typeof userTokens] ||
                              0}
                          </span>
                        </div>

                        {/* Hover Tooltip */}
                        <motion.div
                          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-2 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-bold whitespace-nowrap z-50"
                          initial={{ opacity: 0, y: -10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {club.shortName} TOKENS:{" "}
                          {userTokens[club.id as keyof typeof userTokens] || 0}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black border-l border-t border-white rotate-45 translate-y-1"></div>
                        </motion.div>
                      </motion.div>
                    ))}

                    {clubs.length > 4 && (
                      <motion.div
                        className="relative group"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className="flex items-center gap-2 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-2">
                          <span className="text-sm font-black text-black">
                            +{clubs.length - 4}
                          </span>
                        </div>

                        {/* Extended Tooltip */}
                        <motion.div
                          className="absolute top-full mt-2 right-0 bg-black text-white px-4 py-3 border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-bold z-50 min-w-max"
                          initial={{ opacity: 0, y: -10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {clubs.slice(4).map((club) => (
                            <div
                              key={club.id}
                              className="flex items-center gap-3 mb-2 last:mb-0"
                            >
                              <div className="w-4 h-4 flex items-center justify-center bg-gray-50 border border-white p-0.5">
                                <Image
                                  src={club.logoPath}
                                  alt={club.shortName}
                                  width={12}
                                  height={12}
                                  className="object-contain max-w-full max-h-full"
                                />
                              </div>
                              <span className="min-w-[60px]">
                                {club.shortName}:{" "}
                                <span className="font-black text-main">
                                  {userTokens[
                                    club.id as keyof typeof userTokens
                                  ] || 0}
                                </span>
                              </span>
                            </div>
                          ))}
                          <div className="absolute bottom-full right-4 w-2 h-2 bg-black border-l border-t border-white rotate-45 translate-y-1"></div>
                        </motion.div>
                      </motion.div>
                    )}
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
            POWERED BY FANVAS • DEMOCRATIZING FAN ART
          </p>
        </motion.div>
      </div>
    </div>
  );
}
